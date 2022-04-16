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

        this.reactHook = {};

        // Wait until webpack modules are loaded bebfore initialising hooks.
        if (!window.SP_REACT) {
            window.onload = async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.__BOREALIS__.__REACTHOOK__ = {};
                this.reactHook.backups = {
                    createElement: window.SP_REACT.createElement
                };
                window.SP_REACT.createElement = this.createElement.bind(this);
            }
        } else {
            window.__BOREALIS__.__REACTHOOK__ = {};
            this.reactHook.backups = {
                createElement: window.SP_REACT.createElement
            };
            window.SP_REACT.createElement = this.createElement.bind(this);
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

    handleCommunication(data) {
        console.log('Recieved Data from Borealis Server.');
        console.log(data);
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
                    content: this.renderJSX(
                        `<div className="DialogBody">
                            <div className="
                            ${borealisUI.libraryRoot.classes.Field} 
                            ${borealisUI.libraryRoot.classes.WithFirstRow} 
                            ${borealisUI.libraryRoot.classes.InlineWrapShiftsChildrenBelow} 
                            ${borealisUI.libraryRoot.classes.WithBottomSeparator} 
                            ${borealisUI.libraryRoot.classes.ChildrenWidthFixed} 
                            ${borealisUI.libraryRoot.classes.ExtraPaddingOnChildrenBelow} 
                            ${borealisUI.libraryRoot.classes.StandardPadding} 
                            ${borealisUI.libraryRoot.classes.HighlightOnFocus} 
                            Panel Focusable">
                                <div class="${borealisUI.libraryRoot.classes.FieldLabelRow}">
                                    <div class="${borealisUI.libraryRoot.classes.FieldLabel}">
                                        Current Theme
                                    </div>
                                    <div class="${borealisUI.libraryRoot.classes.FieldChildren}">
                                        <button class="${borealisUI.libraryRoot.classes.DropDownControlButton} DialogButton _DialogLayout Secondary basicdialog_Button_1Ievp Focusable gpfocus gpfocuswithin">
                                            <div class="${borealisUI.libraryRoot.classes.DropDownControlButtonContents}">
                                                <div class="DialogDropDown_CurrentDisplay">Default (SteamOS Holo)</div>
                                                <div class="basicdialog_Spacer_1wB2e"></div>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path d="M17.98 26.54L3.20996 11.77H32.75L17.98 26.54Z" fill="currentColor"></path></svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`
                    )
                })
            }

            if (args[0].toString().includes("RemotePlayTogetherControls")) {
                console.log(args);
            }
        }

        return this.reactHook.backups.createElement.apply(window.SP_REACT, args);
    }

    uninject() {
        // Rollback React Hooks
        window.SP_REACT.createElement = this.reactHook.backups.createElement

        // Rewrite dirty hooks to do nothing, we can't remove them or else SteamOS crashes.
        window.__BOREALIS__.quickAccessHook = () => {}
        window.__BOREALIS__.COMMUNICATE = () => {}
    }
}

window.Borealis = new Borealis();
