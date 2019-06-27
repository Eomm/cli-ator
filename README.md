# cli-bone
A cli tool to build cli tools FASTER


```js
const cli = require('./lib/index')

const insta = cli({
  log: 'info',
  helpPath: 'man/',
  help: 'README.md',
  helpArg: 'help',
  autoloadPath: 'commands/'
  commands: [
    {
      command: 'demo',
      commandPath: 'command/',
      help: 'README.md',
      handler: (args)=>{ console.log('asd'); },
      inputArguments: { /* config */ }
    }
  ]
})

insta.on('start', (command, args) => {

})

insta.on('end', (command) => {

})

insta.on('error', (error, command) => {

})

insta.execute(process.argv.splice(2))
```