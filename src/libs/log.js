const chalk = require('chalk');

module.exports = class logger {

    constructor(subroutineName) {
        this.name = subroutineName;
    }

    info(message) {
        console.log(`[${this.name}] [${chalk.blue('INFO')}] ${message}`);
    }

    warning(message) {
        console.log(`[${this.name}] [${chalk.yellow('WARN')}] ${message}`);
    }

    error(message) {
        console.log(`[${this.name}] [${chalk.red('ERROR')}] ${message}`);
    }
}