/*
Borealis Client, Clientside SteamOS customisation framework.
*/

if (window.Borealis) {
    window.Borealis.uninject();
}

Borealis = class {
    constructor() {
        console.log('BorealisOS Client Initialised!')

        // Figure out where we are.
        this.page_type = document.title;

        // Attempt two way communication with borealis communicator
        if (!window.borealisPush) {
            console.log('Warning! Borealis Communicator is not yet ready!');
            this.borealisReady = false;
        } else {
            window.borealisPush(this.hotloadScript);
            this.borealisReady = true;
        }

        // Attempt to unpack the webpack files and functions.


        // Hook the library.js component.
    }

    installHooks() {
        // Figure out the sidepanel function...
        let currentMax = 0;
        window.webpackJsonp.forEach(func => {
            console.log(func[0]);
            console.log(func[1]);
        })
    }

    uninject() {
        // Cleaning up plugin...

        // Uninjecting.
    }
}

window.Borealis = new Borealis();
