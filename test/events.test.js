'use strict'

const t = require('tap')
const test = t.test
const CliBuilder = require('../lib/index')

test('run all good events for a command', t => {
  t.plan(4)

  const aCommand = 'acommand'

  const cliInstance = CliBuilder({
    commands: [
      {
        command: aCommand,
        handler: (args) => {
          t.strictDeepEquals(args, { _: ['hello'] })
        }
      }
    ]
  })

  cliInstance.on('start', (command, args) => {
    t.strictEqual(command, aCommand)
    t.strictDeepEquals(args, { _: ['hello'] })
  })

  cliInstance.on('end', (command) => {
    t.strictEqual(command, aCommand)
  })

  cliInstance.on('error', () => {
    t.fail('the command should not emit error')
  })
  cliInstance.on('not-found', () => {
    t.fail('the command should not emit not found')
  })

  cliInstance.execute([aCommand, 'hello'])
})

test('run bad events for a command', t => {
  t.plan(1)

  const cliInstance = CliBuilder({
    help: null,
    commands: [
      {
        command: 'aCommand',
        handler: () => {
          t.fail('the handler should not be called')
        }
      }
    ]
  })

  cliInstance.on('start', () => {
    t.fail('the test should not emit start')
  })
  cliInstance.on('end', () => {
    t.fail('the test should not emit end')
  })

  cliInstance.on('error', () => {
    t.fail('the command should not emit error')
  })
  cliInstance.on('not-found', (args) => {
    t.strictDeepEquals(args, commandArgs)
  })

  const commandArgs = ['bad', 'hello']
  cliInstance.execute(commandArgs)
})
