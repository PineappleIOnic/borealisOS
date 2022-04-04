const puppeteer = require('puppeteer-core');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios').default;
const logger = require('./log');
const path = require('path');

module.exports = class borealisInjector {
    constructor() {
        this.log = new logger('Injector');
    }

    async getCEFData() {
        for (let i = 0; i < 4; i++) {
            this.log.info(`Attempting to get CEF Data, Attempt ${i + 1} of 5`)
    
            let response = await axios.get("http://localhost:8080/json/version", {validateStatus: () => true}).then(
                data => data.data
            ).catch((err) => {
                this.log.warning('Something went wrong attempt to contact debugger, retrying in 5 seconds...');
                return false;
            });
    
            if (response !== false) {
                return response
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    
        throw new Error('Failed to get CEF Data after 5 tries. Not attempting again.');
    }

    async inject() {
        // Step 1, check if steam is running and willing to accept connections
        while (true) {
            if (!isSteamRunning()) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                break;
            }
        }

        this.log.info('Steam is running! Attempting to connect...')

        let cefdata = await this.getCEFData();

        // Hook Browser Instance

        for (let i = 0; i < 5; i++) {
            let connectSuccess = await puppeteer.connect({
                browserWSEndpoint: cefdata.webSocketDebuggerUrl,
                defaultViewport: null
            }).then((instance) => {
                this.log.info('Successfully hooked CEF.')
                this.browserInstance = instance;
                return true;
            }).catch((err) => {
                this.log.warning('Failed to hook CEF, waiting 5 seconds then trying again.');
                return false;
            })

            if (connectSuccess) {
                break;
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        let pages = await this.browserInstance.pages();
        this.instances = [];

        await Promise.all(pages.map(async (page) => {
            let title = await page.title();
            const borealisClientPath = require.resolve(path.resolve(__dirname, './client/borealisClient.js'));
            if (title === '') {
                return;
            }
            await page.addScriptTag({ path: borealisClientPath });
            this.log.info(`Injected Borealis Client into page: ${title}`);
            this.instances[title] = page;
        }));
    }
}

// Check if steam is running
const isSteamRunning = async () => {
    let command = `pgrep steamwebhelper`;
    let response = await exec(command);
    if (response.stdout.length !== 0) {
        return true
    }
}