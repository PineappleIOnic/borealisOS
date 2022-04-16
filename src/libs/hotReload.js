const logger = new (require('./log'))('Hot Reload');
const chokidar = require('chokidar');
const { resolve } = require('path');
const { copyFileSync } = require('fs');

module.exports = class HotReload {
    constructor(injectorInstance) {
        this.injector = injectorInstance;
        this.timeouts = {}

        logger.info('Watching for changes...');

        // Watch client folder
        chokidar.watch(resolve('./src/client/')).on('all', (event, path) => this.handleEvent(event, path, 'borealisCore'), {});

        // Watch plugins
        chokidar.watch(resolve('./plugins')).on('all', (event, path) => this.handleEvent(event, path, 'borealisCore'));
    }

    handleEvent(event, path, type) {
        if (this.timeouts[path]) {
            clearTimeout(this.timeouts[path]);
            this.timeouts[path] = setTimeout(() => { this.timeouts[path] = undefined }, 10000);
            return;
        }

        if (type === 'borealisCore' && event === 'change') {
            logger.info('Reloading borealisCore...');
            copyFileSync(resolve('./src/client/borealisCore.js'), resolve(this.injector.detectSteamInstall(), 'steamui/borealis/borealisCore.js'));
            this.injector.instance.addScriptTag({ content: "window.__BOREALIS__.uninject();" })
            this.injector.instance.addScriptTag({ path: path });
        } else if (type === 'plugin') {

        }
    }
}