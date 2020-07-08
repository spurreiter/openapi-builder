#!/usr/bin/env node

const { builder, cli } = require('..')
const log = require('debug')('openapi-builder')

try {
  const config = cli(process.argv.slice(2)).config

  builder(config)

  if (!config.quiet) {
    console.log('output written to "%s"', config.outfile)
  }
} catch (e) {
  log(e)
  console.error('ERROR: %s', e.message)
}
