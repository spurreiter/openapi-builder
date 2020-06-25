const path = require('path')
const fs = require('fs')
const log = require('debug')('openapi-builder:cli')

const CONFIG_FILE = '.openapi-builder.json'

const CONFIG = {
  dirname: '.',
  mainfile: 'main.yaml',
  outfile: 'api.yaml',
  mixinDirnames: ['mixins']
}

const loadJson = (filename) => JSON.parse(fs.readFileSync(filename, 'utf8'))

const saveJson = (filename, data, isForce) => {
  try {
    if (isForce) throw new Error()
    fs.statSync(filename)
  } catch (e) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8')
  }
}

const toConfigfile = filename => {
  try {
    const stat = fs.statSync(filename)
    const dirname = stat.isDirectory()
      ? filename
      : path.dirname(filename)

    if (!/\.json$/.test(filename) || stat.isDirectory()) {
      return path.resolve(dirname, CONFIG_FILE)
    }

    return filename
  } catch (e) {}
}

const loadConfig = (filename) => {
  const config = loadJson(filename)
  const dirname = path.dirname(filename)

  ;['dirname', 'mainfile', 'outfile'].forEach(key => {
    config[key] = path.resolve(dirname, config[key])
  })

  return config
}

const help = () => console.log(`
    openapi-builder [OPTIONS] [configfile]

    --help|-h         show help text
    --quiet|-q        quiet operation; no console log
    init              initialize config
    init --force|-f   force overwrite config

`)

function cli (argv) {
  const cmd = {
    configFile: toConfigfile(path.resolve(process.cwd(), CONFIG_FILE))
  }

  while (argv.length) {
    const arg = argv.shift()
    switch (arg) {
      case 'help':
      case '--help':
      case '-h':
        cmd.help = true
        break
      case 'init':
        cmd.init = true
        cmd.config = CONFIG
        break
      case '--force':
      case '-f':
        cmd.force = true
        break
      case '--quiet':
      case '-q':
        cmd.quiet = true
        break
      default:
        cmd.configFile = toConfigfile(path.resolve(process.cwd(), arg))
        break
    }
  }

  log('%j', cmd)

  if (cmd.help) {
    help()
    process.exit(0)
  }
  if (cmd.init) {
    saveJson(cmd.configFile, cmd.config, cmd.force)
    process.exit(0)
  }
  if (cmd.configFile) {
    cmd.config = loadConfig(cmd.configFile)
  }

  return cmd
}

module.exports = {
  cli
}
