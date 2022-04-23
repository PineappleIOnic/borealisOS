const BorealisPatch = require('../borealisPatch');
const fs = require('fs');
const path = require('path');
const http = require('http'); // or 'https' for https:// URLs

module.exports = class CorePatch extends BorealisPatch {
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
        if (!process.argv.includes('--inject-devtools')) {
            return;
        } else {
            console.log('Injecting React Devtools, Make sure you have run "create_react_tunnel.sh" on your development machine.')
        }

        let BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), 'borealisOS');
        let fileData = fs.readFileSync(file);

        if (!fs.existsSync(path.resolve(steamInstall, 'steamui') + '/borealis')) {
            fs.mkdirSync(path.resolve(steamInstall, 'steamui') + '/borealis', { recursive: true });
        }

        let devtools = fs.createWriteStream(path.resolve(steamInstall, 'steamui') + '/borealis/devtools.js');
        let promise = new Promise((resolve, reject) => {
            const request = http.get("http://localhost:8097", function (response) {
                response.pipe(devtools);
    
                // after download completed close filestream
                devtools.on("finish", () => {
                    devtools.close();
                    let targetStringIndex = fileData.indexOf('<title>SP</title>');
    
                    fileData = fileData.slice(0, targetStringIndex + '<title>SP</title>'.length)
                        + `<script src="/borealis/devtools.js"></script>`
                        + fileData.slice(targetStringIndex + '<title>SP</title>'.length, fileData.length);
            
                    fs.writeFileSync(file, fileData);

                    resolve();
                });
            });
        })

        return promise
    }
}