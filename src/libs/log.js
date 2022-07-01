const chalk = require('chalk')

module.exports = class logger {
  constructor () {
    this.name = ''
    for (let i = 0; i < arguments.length; i++) {
      this.name = this.name + ' ' + `[${arguments[i]}]`
    }
  }

  info (message) {
    console.log(`${this.name} [${chalk.blue('INFO')}] ${message}`)
  }

  warning (message) {
    console.log(`${this.name} [${chalk.yellow('WARN')}] ${message}`)
  }

  error (message) {
    console.log(`${this.name} [${chalk.red('ERROR')}] ${message}`)
  }
}
