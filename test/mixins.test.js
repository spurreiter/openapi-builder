const assert = require('assert')
const { traverse, mergeMixins, applyMixins } = require('../src/mixins.js')

describe('utils', function () {
  describe('mergeMixins', function () {
    const mixins = {
      Record: {
        type: 'object',
        properties: {
          id: { format: 'uuid' }
        }
      },
      Test: {
        type: 'object',
        properties: {
          testId: { type: 'string' }
        }
      }
    }

    it('shall merge mixins', function () {
      const source = {
        $mixins: ['Record'],
        $mixin: 'Test',
        properties: {
          array: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
      const r = mergeMixins(source, mixins)
      // console.log(JSON.stringify(r, null, 2))
      assert.deepStrictEqual(r, {
        type: 'object',
        properties: {
          id: {
            format: 'uuid'
          },
          testId: {
            type: 'string'
          },
          array: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      })
    })

    it('shall traverse and apply mergeMixins method', function () {
      const source = {
        $mixins: ['Record'],
        properties: {
          array: {
            type: 'array',
            items: {
              $mixin: 'Test'
            }
          }
        }
      }
      const fn = source => mergeMixins(source, mixins)
      const r = traverse(source, fn)

      // console.log(JSON.stringify(r, null, 2))
      assert.deepStrictEqual(r, {
        type: 'object',
        properties: {
          id: {
            format: 'uuid'
          },
          array: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                testId: { type: 'string' }
              }
            }
          }
        }
      })
    })
  })

  describe('applyMixins', function () {
    it('shall apply mixin', function () {
      const mixins = {
        Record: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'UUID....',
              example: '1a13d9d2-7b08-45cf-95cb-2108f6e6b963'
            }
          }
        },
        Test: {
          type: 'object',
          properties: {
            testId: {
              description: 'test UUID'
            }
          }
        }
      }

      const obj = {
        Organisation: {
          $mixins: ['Record', 'Test'],
          type: 'object',
          properties: {
            id: { example: '8cc1ca6e-5352-47da-a879-390ec1ada662' },
            orgId: {
            }
          }
        }
      }

      const r = applyMixins(obj.Organisation, { mixins })
      // console.log(JSON.stringify(r, null, 2))

      assert.deepStrictEqual(r, {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', description: 'UUID....' },
          testId: { type: 'string', description: 'test UUID' },
          orgId: { type: 'string' }
        },
        example: {
          id: '8cc1ca6e-5352-47da-a879-390ec1ada662'
        }
      })
    })
  })
})
