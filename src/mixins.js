const _merge = require('lodash.merge')

const jsonClean = obj => JSON.parse(JSON.stringify(obj))

/**
 * traverse an object or array
 * if object is detected than `fn` is applied
 * @param  {any} obj
 * @param  {Function} fn
 * @return {any}
 */
function traverse (obj, fn) {
  if (obj && Array.isArray(obj)) {
    return obj.map(o => traverse(o, fn))
  } else if (obj && typeof obj === 'object') {
    const trans = fn(obj)
    return Object.keys(trans).reduce((o, key) => {
      o[key] = traverse(trans[key], fn)
      return o
    }, {})
  } else {
    return obj
  }
}

/**
 * merge source with detected mixins
 * @param  {object} source
 * @param  {object} mixins
 * @return {object}
 */
function mergeMixins (source, mixins) {
  const target = {}

  if (source.$mixin) {
    const mixin = source.$mixin
    if (!mixins[mixin]) {
      console.error('missing mixin %s', mixin)
    } else {
      _merge(target, mixins[mixin])
    }
    delete source.$mixin
  }

  if (source.$mixins) {
    source.$mixins.forEach(mixin => {
      if (!mixins[mixin]) {
        console.error('missing mixin %s', mixin)
      } else {
        _merge(target, mixins[mixin])
      }
    })
    delete source.$mixins
  }

  if (target !== source) {
    _merge(target, source)
  }

  return target
}

const EXTRA_MARKER = '$extra'

const stripExtraKey = key => key.substring(EXTRA_MARKER.length)
  .split('').map((c, i) => i === 0 ? c.toLowerCase() : c).join('')

function extras (target, useExtra) {
  if (!useExtra) return

  Object.keys(target).forEach((key) => {
    if (key.indexOf(EXTRA_MARKER) === 0) {
      const realkey = stripExtraKey(key)
      if (useExtra && target[key]) {
        target[realkey] = `${target[realkey] || ''}\n${target[key]}`
      }
      delete target[key]
    }
  }, {})
}

function properties (target, useExtra) {
  Object.entries(target.properties || {}).forEach(([key, value]) => {
    extras(value, useExtra)

    let { type, format, description, example, required, ...other } = value

    if (example) {
      if (!target.example) target.example = {}
      target.example[key] = example
    }

    if (required) {
      if (!target.required) target.required = []
      target.required.push(key)
      target.required = Array.from(new Set(target.required))
    }

    if (!value.$ref) {
      type = type || 'string'
    }

    target.properties[key] = jsonClean({
      type, format, ...other, description
    })
  })
}

/**
 * convert to an object by applying mixins
 * @param  {object} source
 * @param  {object[]}  mixins=[]
 * @param  {boolean} useDescriptionImpl
 * @return {object}
 */
function applyMixins (source, { mixins = [], useExtra } = {}) {
  const fn = source => {
    const target = mergeMixins(source, mixins)

    extras(target, useExtra)
    properties(target, useExtra)

    return target
  }

  return traverse(source, fn)
}

module.exports = {
  traverse,
  mergeMixins,
  applyMixins
}
