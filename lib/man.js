'use strict'

const path = require('path')
const { readFileSync } = require('fs')

module.exports = function factory (basePath, printer) {
  return {
    needToShowHelp (helpFile, helpArg, opts) {
      if (opts[helpArg]) {
        this.showHelp(helpFile)
        return true
      }
      return false
    },
    showHelp (helpFile) {
      if (helpFile) {
        const helpText = path.join(basePath, helpFile)
        // try {
        printer(readFileSync(helpText, 'utf8'))
        // } catch (error) {
        //   throw new Error(`There are troubles loading the help file ${helpText}: ${error.message}`)
        // }
      }
    }
  }
}
