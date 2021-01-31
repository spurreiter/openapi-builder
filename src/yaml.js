const fs = require('fs')
const { resolve } = require('path')
const yaml = require('js-yaml')

function yamlFiles (dirname) {
  return fs.readdirSync(dirname).filter(file => /\.ya?ml$/.test(file))
}

function loadYaml (filename) {
  return yaml.load(fs.readFileSync(filename, 'utf8'))
}

function loadYamls (dirname) {
  const files = yamlFiles(dirname)
  return files
    .map(file => loadYaml(resolve(dirname, file)))
}

function dirsWithYamlFiles (dirname) {
  const res = fs.readdirSync(dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => {
      const files = yamlFiles(resolve(dirname, dirent.name))
      return files.length > 0
    })
    .map(dirent => dirent.name)
  return res
}

function reduceToObj (arr) {
  return arr.reduce((o, obj) => {
    return { ...o, ...obj }
  }, {})
}

function loadYamlsAsObj (dirname) {
  return reduceToObj(loadYamls(dirname))
}

function saveYaml (filename, data) {
  fs.writeFileSync(filename, yaml.dump(data), 'utf-8')
}

module.exports = {
  loadYaml,
  loadYamls,
  reduceToObj,
  loadYamlsAsObj,
  saveYaml,
  dirsWithYamlFiles
}

// console.log(loadYamlsAsObj(`${__dirname}/../mixins`))
// console.log(dirsWithYamlFiles(`${__dirname}/../yaml`))
