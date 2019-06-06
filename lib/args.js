'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args, opts) {
  return argv(args, opts)
}
