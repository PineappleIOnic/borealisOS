const BorealisPatch = require('../borealisPatch');
const fs = require('fs');
const path = require('path');

module.exports = class corePatch extends BorealisPatch {
    constructor() {
        super();
        this.name = 'corePatch';
        this.patchFiles = [
            'steamui/index.html'
        ];
    }

    getPatchFiles() {
        return this.patchFiles;
    }

    patch(file, steamInstall) {
        let BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), 'borealisOS');
        let fileData = fs.readFileSync(file);

        if (fileData.includes('BOREALIS MODIFIED')) {
            console.warn('WARNING! DIRTY INSTANCE DETECTED! RESTART YOUR STEAM CLIENT!');
            console.warn('Refusing to initialise Borealis Patches due to dirty instance.');
            return;
        }

        if (!fs.existsSync(path.resolve(steamInstall, 'steamui') + '/borealis')) {
            fs.mkdirSync(path.resolve(steamInstall, 'steamui') + '/borealis');
        }

        fs.copyFileSync(path.resolve('./src/client/borealisCore.js'), path.resolve(steamInstall, 'steamui/borealis/borealisCore.js'));
        fs.copyFileSync(path.resolve(BorealisAppdata, 'borealisUI_Client.js'), path.resolve(steamInstall, 'steamui/borealis/borealisUI.js'));

        let targetStringIndex = fileData.indexOf('<div style="display:none"></div>');

        fileData = fileData.slice(0, targetStringIndex + '<div style="display:none"></div>'.length) 
        + `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`
        + `<script src="/borealis/borealisCore.js"></script>`
        + `<script src="/borealis/borealisUI.js"></script>`
        + fileData.slice(targetStringIndex + '<div style="display:none"></div>'.length, fileData.length);

        // Also add borealis modified tag.
        fileData = '<!-- BOREALIS MODIFIED -->' + fileData;

        fs.writeFileSync(file, fileData);
    }
}