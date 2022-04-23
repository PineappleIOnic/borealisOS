const logger = new (require('./log'))('communicator');

module.exports = class borealisCommunicator {
    async init(injector) {
        this.messageHooks = {};
        this.knownInstances = [];
        await injector.refreshInstances();
        this.injector = injector;

        for (let page in injector.instance) {
            injector.instance[page].exposeFunction(`borealisPush`, (event, data) => {
                return this.recieveData(event, data);
            })
            injector.instance[page].addScriptTag({ content: "window.Borealis.setCommunicatorOnline()" })

            this.knownInstances.push(page);
        }
    }

    async recieveData(event, data) {
        logger.info(`Recieved event ${event}`);

        // Update the borealisPush function just incase any new instances have shown up.
         this.injector.refreshInstances().then(() => {
            for (let page in this.injector.instance) {
                if (!this.knownInstances.includes(page)) {
                    this.injector.instance[page].exposeFunction('borealisPush', (event, data) => {
                        return this.recieveData(event, data);
                    })
                    this.injector.instance[page].addScriptTag({ content: "window.Borealis.setCommunicatorOnline()" })

                    this.knownInstances.push(page);
                }
            }
        });

        if (event) {
            for (const hook in this.messageHooks) {
                if (event === hook) {
                    return this.messageHooks[hook](data)
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