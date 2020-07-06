const { resolve } = require('path')
const { loadYaml, loadYamlsAsObj, saveYaml, dirsWithYamlFiles } = require('./yaml.js')
const { traverse, extractTag, applyMixins, isObject } = require('./mixins.js')
const log = require('debug')('openapi-builder:builder')

class Builder {
  constructor ({
    dirname = process.cwd(),
    mainfile = 'main.yaml',
    outfile = 'api.yaml',
    mixinDirnames = ['mixins', 'responses'],
    useExtra
  } = {}) {
    this.options = {
      dirname,
      mainfile,
      outfile,
      mixinDirnames,
      useExtra
    }
  }

  init () {
    const { dirname, mainfile, mixinDirnames } = this.options
    this.yaml = {}

    this.yaml.main = loadYaml(resolve(dirname, mainfile))

    const dirs = dirsWithYamlFiles(dirname)
    dirs.forEach((key) => {
      this.yaml[key] = loadYamlsAsObj(resolve(dirname, key))
    })

    this.yaml.mixins = mixinDirnames.reduce((o, key) => {
      return { ...o, ...this.yaml[key] }
    }, {})

    return this
  }

  buildSchemas () {
    const { useExtra } = this.options
    const { main, mixins, ...other } = this.yaml

    const schemas = Object.entries(other).reduce((o, [key, value]) => {
      o[key] = Object.keys(value)
        .sort()
        .reduce((o, name) => {
          const schema = value[name]
          o[name] = applyMixins(schema, { mixins, useExtra })
          return o
        }, {})
      return o
    }, {})

    return schemas
  }

  build () {
    const { outfile } = this.options
    const { main } = this.yaml
    const schemas = this.buildSchemas()

    const fn = obj => {
      if (!isObject(obj)) return obj

      Object.entries(obj).forEach(([key, value]) => {
        const [schemaKey] = extractTag(value)
        if (schemaKey) {
          log('schemaKey %s found', schemaKey)
          const schema = schemas[schemaKey]
          if (!schema) {
            console.error('no yaml objects in "%s" found', schemaKey)
          } else {
            obj[key] = schema
          }
        }
      })
      return obj
    }

    const data = traverse(main, fn)

    saveYaml(outfile, data)
  }
}

function builder (opts) {
  return new Builder(opts).init().build()
}

module.exports = builder
