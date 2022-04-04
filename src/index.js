const borealisCommunicator = require('./communicator');
const borealisInjector = require('./injector');
const logger = new (require('./log'))('Core');

async function init() {
    logger.info('Initialising Borealis Injector');

    const injector = new borealisInjector();
    await injector.inject();

    logger.info('Injection finished. Starting communicator.');

    const communicator = new borealisCommunicator().init(injector);
}

init();