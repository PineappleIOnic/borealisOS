const borealisCommunicator = require('./libs/communicator');
const borealisInjector = require('./libs/injector');
const logger = new (require('./libs/log'))('Core');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const BorealisUI = require('./libs/borealisUI');

function generateUILib(injector) {
    let BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), 'borealisOS');

    if (!fs.existsSync(BorealisAppdata)) {
        fs.mkdirSync(BorealisAppdata);
        logger.info('First Run, Generating Files...');

        let steamInstall = injector.detectSteamInstall();

        let spData = fs.readFileSync(path.resolve(steamInstall, 'steamui/sp.js'));

        if (spData.includes('BOREALIS')) {
            logger.error('Could not update sp.js hash due to the file being dirty.');
            return;
        }

        // Generate Hash
        let spHash = crypto.createHash('sha256');
        spHash = (spHash.update(spData)).digest('hex');

        logger.info(`sp.js hash: ${spHash}`);

        fs.writeFileSync(path.resolve(BorealisAppdata, 'steamData.json'), JSON.stringify({
            'spHash': spHash
        }));

        logger.info('Regenerating UI Libraries...');

        let borealisUI = new BorealisUI();

        let borealisUIScripts = borealisUI.decode({
            'sp': spData.toString(),
            'library': fs.readFileSync(path.resolve(steamInstall, 'steamui/library.js')),
            'libraryRoot': fs.readFileSync(path.resolve(steamInstall, 'steamui/libraryroot~sp.js')),
            'login': fs.readFileSync(path.resolve(steamInstall, 'steamui/login.js'))
        });

        fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Client.js'), borealisUIScripts.clientScript);
        fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Server.js'), borealisUIScripts.serverScript);
    } else {
        let oldSpHash = '';
        try {
            oldSpHash = JSON.parse(fs.readFileSync(path.resolve(BorealisAppdata, 'steamData.json')))['spHash']
        } catch {
            logger.warning('steamData.json missing or corrupted, regenerating...');
        }

        let currentSpData = fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/sp.js'));

        let currentSpHash = crypto.createHash('sha256');
        currentSpHash = (currentSpHash.update(currentSpData)).digest('hex');

        if (oldSpHash !== currentSpHash && currentSpData.includes('BOREALIS') == false) {
            logger.info('Detected new version of steam. Updating UI Libs.');
            logger.info('New Steam sp.js hash: ' + currentSpHash);

            let borealisUI = new BorealisUI();

            let borealisUIScripts = borealisUI.decode({
                'sp': currentSpData.toString(),
                'libraryRoot': fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/libraryroot~sp.js')),
                'login': fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/login.js'))
            });

            fs.writeFileSync(path.resolve(BorealisAppdata, 'steamData.json'), JSON.stringify({
                'spHash': currentSpHash
            }));

            fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Client.js'), borealisUIScripts.clientScript);
            fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Server.js'), borealisUIScripts.serverScript);
        }
    }
}

async function init() {
    const injector = new borealisInjector();

    generateUILib(injector);

    let BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), 'borealisOS');

    logger.info('Initialising Borealis Injector');
    await injector.inject(BorealisAppdata);

    logger.info('Injection finished. Starting communicator.');

    const communicator = new borealisCommunicator().init(injector);

    process.on('SIGINT', async function () {
        logger.info("Shutting down BorealisOS");

        await injector.uninject();

        process.exit();
    });
}

init();