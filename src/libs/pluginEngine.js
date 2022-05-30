const fs = require('fs');
const { resolve } = require('path');
const logger = new (require('./log'))('Plugin Engine');
const babel = require('@babel/core');


module.exports = class PluginEngine {
    constructor(injectorInstance, communicator) {
        logger.info('Transpiling Plugins...');

        // Read all plugins
        try {
            fs.accessSync(resolve('./plugins'))
        }
        catch {
            fs.mkdirSync(resolve('./plugins', { recursive: true }));
            return;
        }

        let allPlugins = {};

        fs.readdirSync(resolve('./plugins')).forEach(file => {
            // Read file
            let data = fs.readFileSync(resolve('./plugins', file)).toString();

            // Transpile
            let transpiled = babel.transformSync(data, {
                presets: ['@babel/preset-react']
            });

            logger.info(`Transpiled ${file}`);

            // Send to communicator
            communicator.send('plugin', {
                name: file,
                contents: transpiled.code
            });
        });
    }
}