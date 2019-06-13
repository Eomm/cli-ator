#!/usr/bin/env node

// @ts-check

'use strict'

/**
 * - configurare un logger
 * - avere gli args gratis
 * - avere help gratis
 * - avere commands loading
 */

const pino = require('pino')
const Commist = require('commist')
const { EventEmitter } = require('events')
const man = require('./man')
const parseArgs = require('./args')

const defaultOptions = {
  log: 'info',
  help: 'help',
  helpArg: 'help',
  commandsHelp: './help/',
  commandsPath: './commands/',
  commands: []
}

module.exports = function factory(options) {

  const opts = Object.assign({}, defaultOptions, options)
  const helper = man(opts.commandsHelp, opts.helpArg)

  const logger = pino({ level: opts.log, prettyPrint: true, base: null, timestamp: false })

  const commist = Commist()
  const emitter = new EventEmitter()

  //
  if (opts.commandsPath) {
    // AUTOLOAD OF COMMANDS

  }


  opts.commands.forEach(cmd => {
    const { command, handler } = cmd
    let fn = handler
    if (!fn) {
      fn = require(command)
    }
    commist.register(command, commandWrap.bind(cmd, fn))
  })

  return {
    on(event, handler) {
      emitter.on(event, handler)
    },
    execute(args) {
      setImmediate(() => {
        const res = commist.parse(args)
        if (res) {
          emitter.emit('not-found')
          helper.showHelp(opts.help)
        }
      })
    }
  }

  ////************************* */

  function commandWrap(fn, args) {
    emitter.emit('start', this.cmd)
    const opts = parseArgs(args)
    if (helper.needToShowHelp(this.help, this.helpArg, opts)) {
      return
    }

    try {
      const result = fn(opts, logger)
      if (typeof result.then === 'function') {
        result
          .then(() => { emitter.emit('end', this.cmd) })
          .catch((error) => { emitter.emit('error', error, this.cmd) })
        return
      }
      emitter.emit('end', this.cmd)
    } catch (error) {
      emitter.emit('error', error, this.cmd)
    }
  }
}
