
const RE_DIGIT = /[-+]?[0-9.]+/
const RE_NUM = RegExp(`^${RE_DIGIT.source}$`)
const RE_QUOTED_NUM = RegExp(`^"(${RE_DIGIT.source})"$`)

const RE_TAG = /\$([_a-zA-Z0-9-]+)(?:\|((?:[^\\$]|[\\].)*)|)\$/

const isNumber = num => !isNaN(Number(num)) && RE_NUM.test(num)

const quotedNumber = num => RE_QUOTED_NUM.exec(num)

const toNumber = num => isNumber(num) ? Number(num) : num

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
    const out = []
    while (string.length) {
      const m = RE_TAG.exec(string)
      if (m) {
        const [_, tag, defaultValue] = m

        const pre = string.substr(0, m.index)
        if (pre) out.push(pre)

        string = string.substring(_.length + m.index, string.length)
        const value = options[tag]

        out.push(value !== undefined
          ? value
          : defaultValue === 'undefined'
            ? undefined
            : defaultValue !== undefined
              ? toNumber(unescape$(defaultValue))
              : `$${tag}$`
        )
      } else {
        // add tail
        out.push(string)
        string = ''
      }
    }
    if (out.length === 1) {
      const val = out[0]
      return isNumber(val)
        ? toNumber(val)
        : quotedNumber(val)
          ? quotedNumber(val)[1]
          : val
    }
    return out.join('')
  } else {
    return string
  }
}

module.exports = {
  extractTag,
  template
}
