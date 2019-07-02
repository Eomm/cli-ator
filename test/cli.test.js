'use strict'

const t = require('tap')
const test = t.test
const CliBuilder = require('../lib/index')

test('run all good events for a command', t => {
  t.plan(7)

  const aCommand = 'acommand'

  const cliInstance = CliBuilder({
    commands: [
      {
        command: aCommand,
        handler (args, logger) {
          t.strictDeepEquals(args, { _: ['hello'] })
          t.ok(logger, 'the logger must be set')
          t.ok(logger.info, 'the logger.info must be set')
          return 'world'
        }
      }
    ]
  })

  cliInstance.on('start', (command, args) => {
    t.strictEqual(command, aCommand)
    t.strictDeepEquals(args, ['hello'])
  })
  cliInstance.on('end', (command, result) => {
    t.strictEqual(command, aCommand)
    t.strictEqual(result, 'world')
  })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([aCommand, 'hello'])
})

test('run bad events for a command', t => {
  t.plan(1)

  const cliInstance = CliBuilder({
    help: false, // this disable the default help message when not-found event is emitted
    commands: [
      {
        command: 'aCommand',
        handler: () => { t.fail('the handler should not be called') }
      }
    ]
  })

  cliInstance.on('start', () => { t.fail('the test should not emit start') })
  cliInstance.on('end', () => { t.fail('the test should not emit end') })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', (args) => { t.strictDeepEquals(args, commandArgs) })

  const commandArgs = ['bad', 'hello']
  cliInstance.execute(commandArgs)
})

test('promise resolve handler', t => {
  t.plan(4)

  const aCommand = 'promise-cmd'
  const cliInstance = CliBuilder({
    commands: [
      {
        command: aCommand,
        handler () { return Promise.resolve(42) }
      }
    ]
  })

  cliInstance.on('start', (command, args) => {
    t.strictEqual(command, aCommand)
    t.strictDeepEquals(args, [])
  })
  cliInstance.on('end', (command, result) => {
    t.strictEqual(command, aCommand)
    t.strictEqual(result, 42)
  })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([aCommand])
})

test('promise error handler', t => {
  t.plan(3)

  const aCommand = 'promise-cmd'
  const cliInstance = CliBuilder({
    commands: [
      {
        command: aCommand,
        handler () { return Promise.reject(new Error('my error')) }
      }
    ]
  })

  cliInstance.on('start', (command, args) => {
    t.strictEqual(command, aCommand)
    t.strictDeepEquals(args, [])
  })
  cliInstance.on('end', () => { t.fail('the command should not emit end') })
  cliInstance.on('error', (err) => { t.strictEqual(err.message, 'my error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([aCommand])
})

test('handling error', t => {
  t.plan(3)

  const aCommand = 'handler-cmd'
  const cliInstance = CliBuilder({
    commands: [
      {
        command: aCommand,
        handler () { throw new Error('sync error') }
      }
    ]
  })

  cliInstance.on('start', (command, args) => {
    t.strictEqual(command, aCommand)
    t.strictDeepEquals(args, [])
  })
  cliInstance.on('end', () => { t.fail('the command should not emit end') })
  cliInstance.on('error', (err) => { t.strictEqual(err.message, 'sync error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([aCommand])
})

test('commands loading', t => {
  t.plan(2)

  const executeCmd = 'cmd-a'
  const cliInstance = CliBuilder({
    autoloadPath: './test/commands/'
  })

  cliInstance.on('start', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('end', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([executeCmd])
})

test('command requiring', t => {
  t.plan(2)

  const executeCmd = 'cmd-a'
  const cliInstance = CliBuilder({
    commands: [
      {
        command: executeCmd,
        commandPath: './test/commands'
      }
    ]
  })

  cliInstance.on('start', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('end', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([executeCmd])
})

test('commands loading with default help', t => {
  t.plan(2)

  const executeCmd = 'cmd-b'
  const cliInstance = CliBuilder({
    helpPath: './test/man/',
    autoloadPath: './test/commands/'
  })

  cliInstance.on('start', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('end', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([executeCmd, '--help'])
})

test('commands loading with custom command help', t => {
  t.plan(2)

  const executeCmd = 'cmd-a'
  const cliInstance = CliBuilder({
    helpPath: './test/man/',
    autoloadPath: './test/commands/',
    commands: [
      {
        command: executeCmd,
        commandPath: './test/commands/',
        help: 'a.txt'
      }
    ]
  })

  cliInstance.on('start', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('end', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([executeCmd, '--help'])
})

test('commands loading with custom parameter help', t => {
  t.plan(3)

  const executeCmd = 'cmd-c'
  const cliInstance = CliBuilder({
    printer (helpMsg) { t.strictEqual(helpMsg, 'help for command c') },
    helpArg: 'aiuto',
    helpPath: './test/man/',
    autoloadPath: './test/commands/',
    handler () { t.fail('the handler should be called when help is requested') }
  })

  cliInstance.on('start', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('end', (command) => { t.strictEqual(command, executeCmd) })
  cliInstance.on('error', () => { t.fail('the command should not emit error') })
  cliInstance.on('not-found', () => { t.fail('the command should not emit not found') })

  cliInstance.execute([executeCmd, '--aiuto'])
})

test('commands with custom parameter help', t => {
  t.plan(4)

  let order = 0
  const cliInstance = CliBuilder({
    printer (helpMsg) {
      switch (order) {
        case 0:
          t.strictEqual(helpMsg, 'help custom manual for cli when the command is not found')
          break
        case 1:
          t.strictEqual(helpMsg, 'help for command a')
          break
        default:
          t.fail('the printer must be called twice')
      }
      order++
    },
    helpArg: 'aiuto',
    helpPath: './test/man/',
    commands: [
      {
        command: 'one',
        help: 'custom-help',
        helpArg: 'one-help',
        handler () { t.strictEqual(order, 1, 'the handler should be called when one --aiuto') }
      },
      {
        command: 'two',
        help: 'a.txt',
        handler () { t.strictEqual(order, 1, 'the handler should be called when two --one-help') }
      }
    ]
  })

  cliInstance.execute(['one', '--one-help'])
  cliInstance.execute(['one', '--aiuto'])
  cliInstance.execute(['two', '--one-help'])
  cliInstance.execute(['two', '--aiuto'])
})

test('error no param', t => {
  t.plan(1)
  t.throws(() => { CliBuilder() }, 'missing options parameter')
})
