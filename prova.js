
const cli = require('./lib/index')

const insta = cli({
  help: 'help',
  helpArg: 'help',
  commandsHelp: 'provaaman',
  commandsPath: 'provaa/',
  commands: [
    {
      command: 'demo',
      help: 'comcom',
      // helpArg: 'asd',
      handler: (args) => {
        console.log('asd')
      },
      inputArguments: {
        boolean: ['help'],
        alias: {
          help: ['h']
        }
      }
    }
  ]
})

insta.on('load', (command, args) => {
  console.log('load', command)
})

insta.on('start', (command, args) => {
  console.log('start', command)
})

insta.on('end', (command) => {
  console.log('end', command)
})

insta.on('error', (error, cmd) => {
  console.log('err', error)
})

insta.execute(process.argv.splice(2))
