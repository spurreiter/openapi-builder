
const isNumber = num => !isNaN(Number(num))

const toNumber = num => isNumber(num) ? Number(num) : num

const RE_TAG = /\$([a-zA-Z0-9-]+)(?:\|((?:[^\\$]|[\\].)*)|)\$/
const RE_TAG_ALL = new RegExp(RE_TAG.source, 'g')

const unescape$ = str => typeof str === 'string'
  ? str.replace(/\\\$/g, '$')
  : str

const extractTag = string => {
  const m = typeof string === 'string' && RE_TAG.exec(string)
  if (m && m[1]) {
    // eslint-disable-next-line no-unused-vars
    const [_, tag, defaultValue] = m
    return [tag, unescape$(defaultValue)]
  }
  return []
}

const template = (string, options = {}) => {
  if (typeof string === 'string') {
    return toNumber(string.replace(RE_TAG_ALL, (m, tag, defaultValue) => {
      const value = options[tag]
      return value !== undefined
        ? value
        : defaultValue !== undefined
          ? unescape$(defaultValue)
          : `$${tag}$`
    }))
  } else {
    return string
  }
}

module.exports = {
  extractTag,
  template
}
