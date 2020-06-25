#!/usr/bin/env node

const { builder, cli } = require('..')

const config = cli(process.argv.slice(2)).config

builder(config)

if (!config.quiet) {
  console.log('output written to "%s"', config.outfile)
}
