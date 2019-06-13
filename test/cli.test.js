'use strict'

const { test } = require('tap')

const cli = require('./lib/index')

test('should apply default parameter', t => {
  t.plan(2)

  const insta = cli()

  insta.on('start', (command, args) => {
  })

  insta.on('end', (command) => {
  })

  insta.on('error', (error) => {
  })

  insta.execute([])
})

test('should run all the events', t => {
  t.plan(2)

  const insta = cli()

  insta.on('start', (command, args) => {
  })

  insta.on('end', (command) => {
  })

  insta.on('error', (error) => {
  })

  insta.execute([])
  insta.execute([])
})

test('should throw if the execute parameter is not an array', t => {
  t.plan(2)

  const insta = cli()
  insta.execute([])
})
