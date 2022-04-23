const BorealisPatch = require('../borealisPatch');
const fs = require('fs');
const path = require('path');

module.exports = class LibRootPatch extends BorealisPatch {
    constructor() {
        super();
        this.name = 'libRootPatch';
        this.patchFiles = [
            'steamui/libraryroot~sp.js'
        ];
    }

    getPatchFiles() {
        return this.patchFiles;
    }

    patch(file, steamInstall) {
        let fileData = fs.readFileSync(file);

        if (!fs.existsSync(path.resolve(steamInstall, 'steamui') + '/borealis')) {
            fs.mkdirSync(path.resolve(steamInstall, 'steamui') + '/borealis', { recursive: true });
        }

        fs.copyFileSync(path.resolve('./src/client/borealisTiny.js'), path.resolve(steamInstall, 'steamui/borealis/borealisTiny.js'));

        let targetStringIndex = fileData.indexOf('<div id="browserview_target"></div>');

        fileData = fileData.slice(0, targetStringIndex + '<div id="browserview_target"></div>'.length) 
        + `<script src="/borealis/borealisTiny.js"></script>`
        + fileData.slice(targetStringIndex + '<div id="browserview_target"></div>'.length, fileData.length);

        fs.writeFileSync(file, fileData);
    }
}