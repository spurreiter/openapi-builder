const assert = require('assert')
const { extractTag, template } = require('../src/template.js')

describe('template', function () {
  describe('extractTag', function () {
    it('shall ignore undefined input', function () {
      const [tag, defaultValue] = extractTag()
      assert.strictEqual(tag, undefined)
      assert.strictEqual(defaultValue, undefined)
    })

    it('shall ignore Number', function () {
      const [tag, defaultValue] = extractTag(100)
      assert.strictEqual(tag, undefined)
      assert.strictEqual(defaultValue, undefined)
    })

    it('shall find tag', function () {
      const [tag, defaultValue] = extractTag('$foo$')
      assert.strictEqual(tag, 'foo')
      assert.strictEqual(defaultValue, undefined)
    })

    it('shall find tag surrounded by text', function () {
      const [tag, defaultValue] = extractTag('foo bar $foo$ bar')
      assert.strictEqual(tag, 'foo')
      assert.strictEqual(defaultValue, undefined)
    })

    it('shall find tag with default value', function () {
      const [tag, defaultValue] = extractTag('foo bar $foo|bar baz$ bar')
      assert.strictEqual(tag, 'foo')
      assert.strictEqual(defaultValue, 'bar baz')
    })

    it('shall unescape default value', function () {
      const [tag, defaultValue] = extractTag('foo bar $foo|bar\\$baz$ bar')
      assert.strictEqual(tag, 'foo')
      assert.strictEqual(defaultValue, 'bar$baz')
    })
  })

  describe('template', function () {
    it('shall ignore undefined input', function () {
      const r = template()
      assert.strictEqual(r, undefined)
    })

    it('shall ignore Number', function () {
      const r = template(100)
      assert.strictEqual(r, 100)
    })

    it('shall find tag but return same', function () {
      const r = template('$foo$')
      assert.strictEqual(r, '$foo$')
    })

    it('shall replace tag with default value', function () {
      const r = template('$foo|bar$')
      assert.strictEqual(r, 'bar')
    })

    it('shall replace tag', function () {
      const r = template('$foo$', { foo: 'bar' })
      assert.strictEqual(r, 'bar')
    })

    it('shall replace tag overwriting default', function () {
      const r = template('$foo|baz$', { foo: 'bar' })
      assert.strictEqual(r, 'bar')
    })

    it('shall return all tags', function () {
      const r = template('This $foo$ is $bar$ or baz!')
      assert.strictEqual(r, 'This $foo$ is $bar$ or baz!')
    })

    it('shall replace some tags', function () {
      const r = template('This $foo$ is $bar$ or baz!', { bar: 'fobaz' })
      assert.strictEqual(r, 'This $foo$ is fobaz or baz!')
    })

    it('shall replace all tags', function () {
      const r = template('This $foo$ is $bar$ or baz!', { foo: 'zabof', bar: 'fobaz' })
      assert.strictEqual(r, 'This zabof is fobaz or baz!')
    })

    it('shall replace all tags with defaults', function () {
      const r = template('This $foo|oof$ is $bar|rab$ or baz!')
      assert.strictEqual(r, 'This oof is rab or baz!')
    })

    it('shall unescape defaults', function () {
      const r = template('This $foo|o\\$of$ is $bar|\\$rab$ or baz!')
      assert.strictEqual(r, 'This o$of is $rab or baz!')
    })
  })
})
