/*
Borealis Client, Clientside SteamOS customisation framework.
*/
if (window.Borealis) {
    window.Borealis.uninject();
}

import settingsPage from './pages/settingsPage.jsx';
import lambdaLogo from './assets/lambdaLogo.jsx';

let Borealis = class {
    constructor() {
        console.log('BorealisOS Client Initialised!')

        // Create our hook functions.
        window.__BOREALIS__ = {};
        window.__BOREALIS__.COMMUNICATE = this.handleCommunication.bind(this);
        window.__BOREALIS__.quickAccessHook = this.quickAccessHook.bind(this);
        window.__BOREALIS__.uninject = this.uninject.bind(this);

        this.hooks = {};

        this.serverData = {};

        // Wait until webpack modules are loaded bebfore initialising hooks.
        if (!window.SP_REACT) {
            window.onload = async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.hooks.backups = {
                    createElement: window.SP_REACT.createElement,
                    focusNav: window.FocusNavController.m_FocusChangedCallbacks.Register(this.focusNavControllerHook.bind(this))
                };
                window.SP_REACT.createElement = this.createElement.bind(this);
            }
        } else {
            this.hooks.backups = {
                createElement: window.SP_REACT.createElement,
                focusNav: window.FocusNavController.m_FocusChangedCallbacks.Register(this.focusNavControllerHook.bind(this))
            };
            window.SP_REACT.createElement = this.createElement.bind(this);
        }

        this.communicatorOnline = false;
    }

    async setCommunicatorOnline() {
        this.communicatorOnline = true;

        let theme = await window.borealisPush("currentTheme");

        if (theme.name !== "Default (SteamOS Holo)") {
            this.setTheme(theme.content)
        }
    }

    // Convert SteamUI Classes into Borealis ones.
    computeStyle(data) {
        let classes = data.split(' ');
        let result = "";

        classes.forEach(a => {
            for (let library in window.__BOREALISUI__) {
                for (let obj in window.__BOREALISUI__[library].classes) {
                    if (window.__BOREALISUI__[library].classes[obj] === a) {
                        result += `window.__BOREALISUI__.${library}.classes.${obj} `;
                    }
                }
            }
        })

        return result;
    }

    async pollServer() {
        console.log('Polling server.')
        this.serverData = {
            currentTheme: await window.borealisPush("currentTheme"),
            availableThemes: await window.borealisPush("getThemes")
        }

        this.serverPoll();
    }

    handleCommunication(event, data) {
        console.log('Recieved Data from Borealis Server.');
        console.log(data);

        switch (event) {
            case "plugin": {
                this.handlePlugin(data);
            }
        }
    }

    handlePlugin(data) {
        console.log('Recieved Plugin Data.');

        try {
            eval(data.contents);
        } catch (e) {
            console.log('Failed to load plugin: ' + data.name);
            console.error(e);
        }
    }

    renderJSX(JSX) {
        const React = window.SP_REACT;

        return eval(window.Babel.transform(JSX, { presets: ["react"] }).code)
    }

    quickAccessHook(Q) {
        Q.push({
            key: 7,
            panel: this.renderJSX(`
<div className="quickaccessmenu_TabGroupPanel_1QO7b Panel Focusable">
    <div className="quickaccesscontrols_PanelSection_Ob5uo">
        <h2>Test 65</h2>
    </div>
</div>`),
            tab: React.createElement(lambdaLogo),
            title: this.renderJSX(`<div className="quickaccessmenu_Title_34nl5">BorealisOS</div>`),
        })
    }

    createElement() {
        const args = Array.prototype.slice.call(arguments);
        const borealisUI = window.__BOREALISUI__;

        if (args[0] instanceof Function) {
            // Settings Hook
            if (args[0].toString().includes('GamepadPagedSettingsPage')) {
                console.log('Detected settings page. Hooking...');

                const React = window.SP_REACT;

                args[2].props.pages.push("separator");

                args[2].props.pages.push({
                    visible: true,
                    title: "BorealisOS",
                    icon: React.createElement(lambdaLogo),
                    route: "/settings/borealisOS",
                    content: React.createElement(settingsPage)
                })
            }

            if (args[0].toString().includes("RemotePlayTogetherControls")) {
                console.log(args);
            }
        }

        return this.hooks.backups.createElement.apply(window.SP_REACT, args);
    }

    focusNavControllerHook() {
        // // A couple checks to make sure we are hooking the correct things.
        // if (!arguments[2]) {return}

        // if (arguments[2].m_Tree.m_ID !== "root") {return}

        // if (!arguments[2].m_element.className.includes("gamepadpagedsettings_PagedSettingsDialog_PageListItem")) {return;};

        // let target = arguments[2].m_Parent.m_Parent.m_Parent.m_rgChildren[1];

        // if (target.m_element.innerText.includes("BorealisOS")) {
        //     console.log('A');
        //     target.Tree.CreateNode(document.getElementById("testOK"))
        // }
    }   

    findNavTree(element) {
        let finalResult = false;

        function crawlTree(tree) {
            if (tree.m_element === element) {
                console.log(tree.m_element);
                return tree;
            }

            if (tree.m_rgChildren) {
                for (let i = 0; i < tree.m_rgChildren.length; i++) {
                    let result = crawlTree(tree.m_rgChildren[i]);
                    if (result) {
                        return result;
                    }
                }
            }
        }

        window.FocusNavController.m_rgGamepadNavigationTrees.forEach(tree => {
            let result = crawlTree(tree.Root);

            if (result) {
                finalResult = result;
            }
        });

        return finalResult;
    }

    setTheme(style) {
        // Check if we already have a theme enabled.
        if (document.getElementById("borealis_theme")) {
            document.getElementById("borealis_theme").innerHTML = style
        } else {
            var themeElement = document.createElement('style');
            themeElement.id = "borealis_theme"
            themeElement.innerHTML = style
            document.body.appendChild(themeElement);
        }
    }

    removeTheme() {
        if (document.getElementById("borealis_theme")) {
            document.getElementById("borealis_theme").remove();
        }
    }

    uninject() {
        // Rollback React Hooks
        window.SP_REACT.createElement = this.hooks.backups.createElement
        this.hooks.backups.focusNav.Unregister()
        this.removeTheme();

        // Rewrite dirty hooks to do nothing, we can't remove them or else SteamOS crashes.
        window.__BOREALIS__.quickAccessHook = () => { }
        window.__BOREALIS__.COMMUNICATE = () => { }
    }
}

window.Borealis = new Borealis();
