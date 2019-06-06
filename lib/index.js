#!/usr/bin/env node
'use strict'

/**
 * - configurare un logger
 * - avere gli args gratis
 * - avere help gratis
 * - avere commands loading
 */

const pino = require('pino')
const Commist = require('commist')
const { needToShowHelp } = require('./man')
const parseArgs = require('./args')

module.exports = function factory (opts) {
  const logger = pino({ level: 'info', prettyPrint: true, base: null, timestamp: false })

  const commist = Commist()
  opts.commands.forEach(cmd => {
    const fn = require(cmd)
    commist.register(cmd, async (args) => {
      const opts = parseArgs(args)
      if (needToShowHelp(cmd, opts)) {
        return
      }

      try {
        logger.debug('Starting %s command', cmd)
        const result = fn(opts)
        if (typeof result.then === 'function') {
          result.catch(console.log)
        }
      } catch (error) {
        // manage sync error
        logger.error(error)
      }
    })
  })

  return {
    execute (args) {
      const res = commist.parse(args)
      if (res) {
        require('./commands/help')(['-h'])
      }
    }
  }
}
