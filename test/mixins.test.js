const assert = require('assert')
const { traverse, mergeMixins, applyMixins, mixinFn } = require('../src/mixins.js')

describe('utils', function () {
  describe('mixinFn', function () {
    const mixin = {
      description: '$description|Invalid Value$',
      nested: {
        number: '$number|400$'
      },
      array: ['$array0|one$']
    }

    it('should use defaults', function () {
      const source = '400'
      const r = mixinFn(source, mixin)
      assert.deepStrictEqual(r, {
        description: 'Invalid Value',
        nested: {
          number: 400
        },
        array: ['one']
      })
    })

    it('should apply mixin function', function () {
      const source = {
        mixin: 400,
        description: 'another value',
        number: 500,
        array0: 'two'
      }
      const r = mixinFn(source, mixin)
      assert.deepStrictEqual(r, {
        description: 'another value',
        nested: {
          number: 500
        },
        array: ['two']
      })
    })
  })

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

    it('shall log missing mixin', function () {
      const source = {
        $mixin: 'NotThere'
      }
      const fn = source => mergeMixins(source, mixins)
      const r = traverse(source, fn)

      // console.log(JSON.stringify(r, null, 2))
      assert.deepStrictEqual(r, {
        ERROR: 'Missing mixin "NotThere"'
      })
    })

    describe('mixin as object', function () {
      const mixins = {
        400: {
          description: '$description|Invalid value$'
        }
      }

      it('shall merge a mixin object with its default values', function () {
        const source = {
          responses: {
            200: { $ref: '#/components/responses/PetResponse' },
            400: {
              $mixin: 400
            }
          }
        }
        const fn = source => mergeMixins(source, mixins)
        const r = traverse(source, fn)

        // console.log(JSON.stringify(r, null, 2))
        assert.deepStrictEqual(r, {
          responses: {
            200: {
              $ref: '#/components/responses/PetResponse'
            },
            400: {
              description: 'Invalid value'
            }
          }
        })
      })

      it('shall merge a mixin object', function () {
        const source = {
          responses: {
            200: { $ref: '#/components/responses/PetResponse' },
            400: {
              $mixin: {
                mixin: 400,
                description: 'Invalid status value'
              }
            }
          }
        }
        const fn = source => mergeMixins(source, mixins)
        const r = traverse(source, fn)

        // console.log(JSON.stringify(r, null, 2))
        assert.deepStrictEqual(r, {
          responses: {
            200: {
              $ref: '#/components/responses/PetResponse'
            },
            400: {
              description: 'Invalid status value'
            }
          }
        })
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
              type: 'string',
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
            id: {
              type: 'string',
              example: '8cc1ca6e-5352-47da-a879-390ec1ada662'
            },
            orgId: {
              type: 'string'
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

    it('shall apply extra description', function () {
      const mixins = {
        Record: {
          type: 'object',
          description: 'Some description',
          $extraDescription: 'and here some additional notes.'
        }
      }

      const obj = {
        Test: {
          $mixins: ['Record']
        }
      }

      const r = applyMixins(obj.Test, { mixins, useExtra: true })
      // console.log(JSON.stringify(r, null, 2))

      assert.deepStrictEqual(r, {
        type: 'object',
        description: 'Some description\nand here some additional notes.'
      })
    })

    it('shall collect required attributes', function () {
      const mixins = {}

      const obj = {
        properties: {
          one: {
            type: 'string',
            required: true
          },
          two: {
            type: 'string'
          },
          three: {
            type: 'string',
            required: true
          }
        }
      }

      const r = applyMixins(obj, { mixins })
      // console.log(JSON.stringify(r, null, 2))

      assert.deepStrictEqual(r, {
        required: [
          'one',
          'three'
        ],
        properties: {
          one: {
            type: 'string'
          },
          two: {
            type: 'string'
          },
          three: {
            type: 'string'
          }
        }
      })
    })

    it('shall not fail on null in example', function () {
      const mixins = {}

      const obj = {
        properties: {
          one: {
            type: 'string',
            required: true
          },
          two: {
            type: 'string'
          },
          three: {
            type: 'string',
            required: true
          }
        },
        example: {
          one: 'one',
          two: null,
          three: '3'
        }
      }

      const r = applyMixins(obj, { mixins })
      // console.log(JSON.stringify(r, null, 2))

      assert.deepStrictEqual(r, {
        required: [
          'one',
          'three'
        ],
        properties: {
          one: {
            type: 'string'
          },
          two: {
            type: 'string'
          },
          three: {
            type: 'string'
          }
        },
        example: {
          one: 'one',
          two: null,
          three: '3'
        }
      })
    })

    it('shall apply templates to mixin', function () {
      const mixins = {
        Test: {
          type: 'object',
          properties: {
            string: {
              type: 'string',
              default: '$_string$'
            },
            number: {
              type: 'number',
              default: '$_number|0$'
            },
            object: '$object$',
            foo: {
              type: 'string',
              default: 'This $foo$ shall be shown'
            }
          },
          defUndefined: '$other|undefined$',
          defNull: '$other|null$',
          defEmptyObj: '$other|{}$',
          defEmptyArr: '$other|[]$',
          defObj: '$other|{"a":1,"b":"B"}$',
          defArr: '$other|[1,"2","C"]$'
        }
      }

      const source = {
        $mixin: {
          mixin: 'Test',
          _string: 'string',
          _number: '200',
          object: {
            type: 'object',
            properties: {
              array: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }

      const r = applyMixins(source, { mixins })
      // console.log(JSON.stringify(r, null, 2))

      assert.deepStrictEqual(r, {
        type: 'object',
        properties: {
          string: {
            type: 'string',
            default: 'string'
          },
          number: {
            type: 'number',
            default: 200
          },
          foo: {
            default: 'This $foo$ shall be shown',
            type: 'string'
          },
          object: {
            type: 'object',
            properties: {
              array: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        },
        defUndefined: undefined,
        defNull: null,
        defEmptyObj: {},
        defEmptyArr: [],
        defObj: { a: 1, b: 'B' },
        defArr: [1, 2, 'C']
      })
    })
  })
})
