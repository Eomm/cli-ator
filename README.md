# cli-ator
A cli tool to **create** cli tools FASTER 🚀


## Install

```
npm i cli-ator
```

## Usage

```js
const cli = require('cli-ator')

const insta = cli({
  printer: console.log, // default
  log: 'info',
  helpPath: 'man/',
  help: 'README.md',
  helpArg: 'help',
  autoloadPath: 'commands/',
  commands: [
    {
      command: 'demo',
      commandPath: 'command/',
      help: 'README.md',
      handler: (args, logger) => { 
        logger.info('My output')
        return 42
      },
      inputArguments: { /* config */ }
    }
  ]
})

insta.on('start', (command, parsedArgs) => {
  // emitted just before the command
})

insta.on('end', (command, result) => {
  // emitted if the command complete successfully. The result contains the returned value of the handler
})

insta.on('error', (error, command) => {
  // emitted when the command handler throws an error or reject a promise
})

insta.on('not-found', (args) => {
  // emitted when the command args don't match any command
})

// exectute the command based on the arguments
insta.execute(process.argv.splice(2))
```