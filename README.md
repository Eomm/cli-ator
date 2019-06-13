# cli-bone
A cli tool to build cli tools FASTER


```js
const cli = require('./lib/index')

const insta = cli({
  help: 'man/help.txt',
  helpArg: 'help',
  commandsHelp: '',
  commandsPath: 'command/',
  commands: [
    {
      command: 'demo',
      help: 'README.md',
      helpArg: 'asd',
      handler: (args)=>{
        console.log('asd');     
      }
    }
  ]
})

insta.on('start', (command, args) => {

})

insta.on('end', (command) => {

})

insta.on('error', (error, cmd) => {

})

insta.execute(process.argv.splice(2))
```