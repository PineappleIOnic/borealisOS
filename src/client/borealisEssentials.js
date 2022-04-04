if (window.borealisEssentials) {
    window.borealisEssentials.eject();
}

borealisEssentials = class {
    constructor() {
        if (document.title === 'SP') {
            this.spHook();
        }
    }

    spHook() {
        // Get main steam window
        let element = document.getElementsByClassName('basiclibrary_AbsoluteDiv__OoSW Panel')[0];

        if (element.children[0].className.includes('GamepadPagedSettingsPage')) {
            settingsHook(element.children[0]);
        }
    }

    settingsHook() {

    }

    eject() {

    }
}