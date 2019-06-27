'use strict'

const path = require('path')
const { readFileSync } = require('fs')

module.exports = function factory (basePath, defaultHelpArg) {
  return {
    needToShowHelp (helpFile, helpArg = defaultHelpArg, opts) {
      if (opts[helpArg]) {
        this.showHelp(helpFile)
        return true
      }
      return false
    },
    showHelp (helpFile) {
      if (helpFile) {
        console.log(readFileSync(path.join(basePath, helpFile), 'utf8'))
      }
    }
  }
}
