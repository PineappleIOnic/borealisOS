const chalk = require('chalk')
const fs = require('fs')
const { resolve } = require('path')

module.exports = class logger {
  constructor () {
    this.name = `[${arguments[0]}]`
    for (let i = 1; i < arguments.length; i++) {
      this.name = this.name + ' ' + `[${arguments[i]}]`
    }

    this.fileName = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
      this.fileName = this.fileName + '_' + arguments[i]
    }

    const borealisLogs = resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS', 'logs')

    if (!fs.existsSync(borealisLogs)) {
      fs.mkdirSync(borealisLogs)
    }

    this.file = resolve(borealisLogs, `${this.fileName}.log`)

    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, `Borealis Logs for ${this.name}`)
    }

    this.stream = fs.createWriteStream(this.file, { flags: 'a' })
  }

  info (message) {
    console.log(`[${chalk.blue('INFO')}] ${this.name} ${message}`)
    this.stream.write(`[INFO] ${this.name} ${message}\n`)
  }

  warning (message) {
    console.log(`[${chalk.yellow('WARN')}] ${this.name} ${message}`)
    this.stream.write(`[WARN] ${this.name} ${message}\n`)
  }

  error (message) {
    console.log(`[${chalk.red('ERROR')}] ${this.name} ${message}`)
    this.stream.write(`[ERROR] ${this.name} ${message}\n`)
  }
}
