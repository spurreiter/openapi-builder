const assert = require('assert')
const { builder, Builder } = require('..')
const { loadYaml } = require('../src/yaml.js')

describe('builder', function () {
  it('shall build example', function () {
    const data = builder({
      dirname: `${__dirname}/../example`,
      mainfile: 'main.yaml',
      mixinDirnames: ['mixins']
    })

    assert.deepStrictEqual(Object.keys(data).sort(), [
      'components',
      'externalDocs',
      'info',
      'openapi',
      'paths',
      'servers',
      'tags'
    ])

    const exp = loadYaml(`${__dirname}/../example/petstore.yaml`)
    assert.deepStrictEqual(data, exp)
  })

  it('shall error if schema is missing', function () {
    const b = new Builder()
    b.yaml = {
      main: {
        components: {
          schemas: '$schemas$'
        }
      },
      mixins: {}
    }
    const data = b.build()

    assert.deepStrictEqual(data, {
      components: { schemas: { ERROR: 'No yaml objects in "schemas" found' } }
    })
  })
})
