/* Borealis UI, A SteamOS 3.0 UI Reverse Engineering Tool used to generate clientside UI libraries for Borealis Core */
const logger = new (require('./log'))('BorealisUI');

module.exports = class BorealisUI {
    constructor() {
        this.generatedCode = {};
    }

    decode(libraries) {
        for (const file in libraries) {
            let window = {};
            let webpackData = {};
            this.generatedCode[file] = {};

            eval(libraries[file].toString());

            window.webpackJsonp.forEach(data => {
                webpackData = { ...data[1], ...webpackData };
            })
    
            this.handleClasses(webpackData, file);
            this.iconHandler(webpackData, file);
        }

        return this.generateScript();
    }

    generateScript() {
        let clientScript = "window.__BOREALISUI__ = JSON.parse(`" + JSON.stringify(this.generatedCode) + "`);";
        let serverScript = "module.exports = JSON.parse(`" + JSON.stringify(this.generatedCode) + "`);";

        return {
            clientScript: clientScript,
            serverScript: serverScript
        }
    }

    handleClasses(data, file) {
        let classes = {};
        // Convert all classes into normal ones...
        for (const property in data) {
            let A = {};

            // Class functions only export to A, anything that crashes with only A is probably not a class module export.
            try {
                data[property](A)
            } catch {
                
            }

            // If object is string:string then it's most likely a class module.
            // SteamOS classes also usually include two underscores so check for those.

            for (const property in A.exports) {
                if (typeof A.exports[property] === "string" &&  (A.exports[property].match(/_/g) || []).length >= 2) {
                    classes[property] = A.exports[property];
                }
            }
        }

        this.generatedCode[file].classes = classes;
    }

    iconHandler(data) {
        // Write code to look for svg createElement and convert them into borealisUI components.

        let icons = {};

        for (const property in data) {
            if (data[property].toString().slice(0, 20).includes(`createElement("svg"`)) {
                // console.log(data[property].toString());
            }
        }
    }
}