const chalk = require('chalk')

module.exports = class logger {
  constructor () {
    this.name = ''
    for (let i = 0; i < arguments.length; i++) {
      this.name = this.name + ' ' + `[${arguments[i]}]`
    }
  }

  info (message) {
    console.log(`[${chalk.blue('INFO')}] ${this.name} ${message}`)
  }

  warning (message) {
    console.log(`[${chalk.yellow('WARN')}] ${this.name} ${message}`)
  }

  error (message) {
    console.log(`[${chalk.red('ERROR')}] ${this.name} ${message}`)
  }
}
