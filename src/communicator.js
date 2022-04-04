const logger = new (require('./log'))('communicator');

module.exports = class borealisCommunicator {
    init(injector) {
        Object.keys(injector.instances).forEach(pageName => {
            let page = injector.instances[pageName];

            page.exposeFunction('borealisPush', data => {
                this.recieveData(data, pageName)
            })
        })
    }

    recieveData(data, page) {
        logger.info(`Recieved data from page: '${page}' data: ${data}`);
    }
}