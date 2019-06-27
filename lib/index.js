#!/usr/bin/env node

// @ts-check

'use strict'

/**
 * - configurare un logger
 * - avere gli args gratis
 * - avere help gratis
 * - avere commands loading
 */

const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const pino = require('pino')
const Commist = require('commist')
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

module.exports = function factory (options) {
  const opts = Object.assign({}, defaultOptions, options)
  const helper = man(opts.commandsHelp, opts.helpArg)

  const logger = pino({ level: opts.log, prettyPrint: true, base: null, timestamp: false })

  const commist = Commist()
  const emitter = new EventEmitter()

  if (opts.commandsPath && fs.existsSync(opts.commandsPath)) {
    const files = fs.readdirSync(opts.commandsPath)
    const autoCommands = files.map(rawCommand => ({ command: rawCommand.replace(/\.js|\.ts/, '') }))
    opts.commands.push(...autoCommands)
  }

  opts.commands.forEach(cmd => {
    const { command, handler } = cmd
    let fn = handler
    if (!fn) {
      fn = require(path.join(process.cwd(), opts.commandsPath, command))
    }
    commist.register(command, commandWrap.bind(cmd, fn))
  })

  return {
    on (event, handler) {
      emitter.on(event, handler)
    },
    execute (args) {
      setImmediate(() => {
        const res = commist.parse(args)
        if (res) {
          emitter.emit('not-found', args)
          helper.showHelp(opts.help)
        }
      })
    }
  }

  /// /************************* */

  function commandWrap (fn, args) {
    emitter.emit('start', this.command)
    const parsedOpts = parseArgs(args, this.inputArguments || opts.inputArguments)
    if (helper.needToShowHelp(this.help || this.command, this.helpArg, parsedOpts)) {
      emitter.emit('end', this.command)
      return
    }

    try {
      const result = fn(parsedOpts, logger)
      if (result && typeof result.then === 'function') {
        result
          .then(() => { emitter.emit('end', this.command) })
          .catch((error) => { emitter.emit('error', error, this.command) })
        return
      }
      emitter.emit('end', this.command)
    } catch (error) {
      emitter.emit('error', error, this.command)
    }
  }
}
