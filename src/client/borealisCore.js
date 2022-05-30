/*
Borealis Client, Clientside SteamOS customisation framework.
*/
if (window.Borealis) {
    window.Borealis.uninject();
}

Borealis = class {
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

        if (theme.name !== "Default") {
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
            tab: this.renderJSX(`
            <svg viewBox="0 0 364 364" xmlns="http://www.w3.org/2000/svg">
 <g>
  <path id="svg_1" d="m223.864,272.729l-38.608,-97.848l-56.603,89.184l-35.487,0l79.052,-127.654l-8.875,-25.229l-30.781,0l0,-30.062l52.691,0l60.521,153.899l26.608,-8.668l8.867,29.813l-57.385,16.565z" fill="currentColor"/>
  <path id="svg_2" d="m337.623,182.198c0,85.579 -69.363,154.934 -154.934,154.934c-85.571,0 -154.936,-69.354 -154.936,-154.934c0,-85.569 69.363,-154.933 154.936,-154.933c85.57,0 154.934,69.364 154.934,154.933z" stroke-width="34" stroke="currentColor" fill="none"/>
 </g>
</svg>`),
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
                    icon: this.renderJSX(`
                    <svg viewBox="0 0 364 364" xmlns="http://www.w3.org/2000/svg">
         <g>
          <path id="svg_1" d="m223.864,272.729l-38.608,-97.848l-56.603,89.184l-35.487,0l79.052,-127.654l-8.875,-25.229l-30.781,0l0,-30.062l52.691,0l60.521,153.899l26.608,-8.668l8.867,29.813l-57.385,16.565z" fill="currentColor"/>
          <path id="svg_2" d="m337.623,182.198c0,85.579 -69.363,154.934 -154.934,154.934c-85.571,0 -154.936,-69.354 -154.936,-154.934c0,-85.569 69.363,-154.933 154.936,-154.933c85.57,0 154.934,69.364 154.934,154.933z" stroke-width="34" stroke="currentColor" fill="none"/>
         </g>
        </svg>`),
                    route: "/settings/borealisOS",
                //     content: this.renderJSX(
                //         `<div className="DialogBody">
                //             <div className="
                //             ${borealisUI.libraryRoot.classes.Field} 
                //             ${borealisUI.libraryRoot.classes.WithFirstRow} 
                //             ${borealisUI.libraryRoot.classes.InlineWrapShiftsChildrenBelow} 
                //             ${borealisUI.libraryRoot.classes.WithBottomSeparator} 
                //             ${borealisUI.libraryRoot.classes.ChildrenWidthFixed} 
                //             ${borealisUI.libraryRoot.classes.ExtraPaddingOnChildrenBelow} 
                //             ${borealisUI.libraryRoot.classes.StandardPadding} 
                //             ${borealisUI.libraryRoot.classes.HighlightOnFocus} 
                //             Panel Focusable">
                //                 <div class="${borealisUI.libraryRoot.classes.FieldLabelRow}">
                //                     <div class="${borealisUI.libraryRoot.classes.FieldLabel}">
                //                         Current Theme
                //                     </div>
                //                     <div class="${borealisUI.libraryRoot.classes.FieldChildren}">
                //                         <button class="${borealisUI.libraryRoot.classes.DropDownControlButton} DialogButton _DialogLayout Secondary basicdialog_Button_1Ievp Focusable gpfocus gpfocuswithin">
                //                             <div class="${borealisUI.libraryRoot.classes.DropDownControlButtonContents}">
                //                                 <div class="DialogDropDown_CurrentDisplay">Default (SteamOS Holo)</div>
                //                                 <div class="basicdialog_Spacer_1wB2e"></div>
                //                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path d="M17.98 26.54L3.20996 11.77H32.75L17.98 26.54Z" fill="currentColor"></path></svg>
                //                             </div>
                //                         </button>
                //                     </div>
                //                 </div>
                //             </div>
                //         </div>`
                //     )
                content: React.createElement(this.renderJSX(`
                (props) => {
                    const elementRef = React.useRef(null);

                    React.useEffect(() => {
                        // Let's attempt to rewrite the Nav.
                        const navTree = this.findNavTree(elementRef.current.parentElement);

                        if (navTree) {
                            navTree.m_rgChildren.push(
                                new navClass(navTree.m_Tree, navTree)
                            )
                        }

                        console.log(navTree);
                    });

                    return (
                        <div ref={elementRef}>

                        </div>
                    )
                }
            `))
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
