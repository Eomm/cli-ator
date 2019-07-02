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
  usage: 'help', // default help file when not found command is triggered
  autoloadPath: null,
  helpPath: 'man/',
  help: 'usage',
  helpArg: 'help'
}

module.exports = function factory (options) {
  if (options == null) {
    throw new Error('missing options parameter')
  }

  const opts = Object.assign({ commands: [] }, defaultOptions, options)
  const helper = man(opts.helpPath, typeof opts.printer === 'function' ? opts.printer : console.log)

  const logger = pino({ level: opts.log, prettyPrint: true, base: null, timestamp: false })

  const commist = Commist()
  const emitter = new EventEmitter()

  if (opts.autoloadPath) {
    const files = fs.readdirSync(opts.autoloadPath)

    const commandInputNames = opts.commands.map(_ => _.command)
    logger.debug('Loading files %o', files)
    const autoCommands = files
      .map(rawCommand => rawCommand.replace(/\.js|\.ts/, ''))
      .filter(fileCommand => !commandInputNames.includes(fileCommand)) // remove duplicates
      .map(rawCommand => ({
        help: rawCommand,
        command: rawCommand,
        commandPath: opts.autoloadPath
      }))
    opts.commands.push(...autoCommands)
  }

  opts.commands.forEach(cmd => {
    const { command, handler, commandPath } = cmd
    let fn = handler
    if (!fn) {
      fn = require(path.join(process.cwd(), commandPath, command))
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

  function commandWrap (fn, args) {
    emitter.emit('start', this.command, args)
    const parsedOpts = parseArgs(args, this.inputArguments)
    if (helper.needToShowHelp(this.help, this.helpArg || opts.helpArg, parsedOpts)) {
      emitter.emit('end', this.command)
      return
    }

    try {
      const result = fn(parsedOpts, logger)
      if (result && typeof result.then === 'function') {
        result
          .then((returned) => { emitter.emit('end', this.command, returned) })
          .catch((error) => { emitter.emit('error', error, this.command) })
        return
      }
      emitter.emit('end', this.command, result)
    } catch (error) {
      emitter.emit('error', error, this.command)
    }
  }
}
