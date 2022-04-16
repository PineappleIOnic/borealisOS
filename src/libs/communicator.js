const logger = new (require('./log'))('communicator');

module.exports = class borealisCommunicator {
    init(injector) {
        injector.instance.exposeFunction('borealisPush', (event, data)  => {
            this.recieveData(event, data)
        })

        this.messageHooks = {};
    }

    recieveData(event, data) {
        logger.info(`Recieved event ${event}`);

        if (event) {
            for (const hook in this.messageHooks) {
                if (event === hook) {
                    this.messageHooks[hook](data)
                }
            }
        } else {
            logger.warning('Recieved message without event.')
        }
    }

    registerEventHook(event, func) {
        this.messageHooks[event] = func
    }
}