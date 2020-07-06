const _merge = require('lodash.merge')

const jsonClean = obj => JSON.parse(JSON.stringify(obj))

const isNumber = num => !isNaN(Number(num))

const isObject = (obj) => (typeof obj === 'object' && !Array.isArray(obj))

const toNumber = num => isNumber(num) ? Number(num) : num

const RE_TAG = /^\$([a-zA-Z0-9-]+)\$\s*(?:(.*)|)$/

const extractTag = value => {
  const m = typeof value === 'string' && RE_TAG.exec(value)
  if (m && m[1]) {
    m.shift()
    return m
  }
  return []
}

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
    const trans = fn ? fn(obj) : obj
    return Object.keys(trans).reduce((o, key) => {
      o[key] = traverse(trans[key], fn)
      return o
    }, {})
  } else {
    return fn ? fn(obj) : obj
  }
}

/**
 * mixin function to either apply $default or mixin variables
 * @param {object} source
 * @param {object} mixin
 * @param {string} name
 * @return {object}
 */
function mixinFn (source, mixin, name) {
  const extractedValue = (value, source) => {
    const [tag, defaultValue] = extractTag(value)
    if (tag) {
      const val = source[tag]
      return val === undefined
        ? toNumber(defaultValue)
        : val
    } else {
      return value
    }
  }

  const fn = obj => {
    if (Array.isArray(obj)) {
      return obj
    }

    if (!isObject(obj)) {
      return extractedValue(obj, source)
    }

    const target = {}
    Object.entries(obj).forEach(([key, value]) => {
      target[key] = extractedValue(value, source)
    })
    return target
  }

  return traverse(mixin, fn)
}

/**
 * [getMixin description]
 * @param {object} source
 * @param {object} mixins
 * @return {object}
 */
function getMixin (source, mixins) {
  const isObject = typeof source === 'object'
  const name = isObject
    ? source.mixin
    : source
  if (!mixins[name]) {
    console.error('missing mixin %s', name)
  } else {
    return mixinFn(source, mixins[name], name)
  }
}

/**
 * merge source with detected mixins
 * @param  {object} source
 * @param  {object} mixins
 * @return {object}
 */
function mergeMixins (source, mixins) {
  if (!isObject(source)) return source

  const target = {}

  if (source.$mixin) {
    const m = getMixin(source.$mixin, mixins)
    _merge(target, m)
    delete source.$mixin
  }

  if (source.$mixins) {
    source.$mixins.forEach(mixin => {
      const m = getMixin(mixin, mixins)
      _merge(target, m)
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
  extractTag,
  mergeMixins,
  applyMixins,
  mixinFn,
  isObject
}
