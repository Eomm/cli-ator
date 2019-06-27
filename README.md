# cli-bone
A cli tool to build cli tools FASTER


```js
const cli = require('./lib/index')

const insta = cli({
  usage: 'man/help.txt',
  helpArg: 'help',
  inputArguments: { /* config */ },
  commandsUsagePath: '',
  commandsPath: 'command/',
  commands: [
    {
      command: 'demo',
      usage: 'README.md',
      helpArg: 'asd',
      handler: (args)=>{
        console.log('asd');
      },
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