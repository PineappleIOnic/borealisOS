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
                content: React.createElement(this.renderJSX(`
                (props) => {
                    const [themes, setThemes] = React.useState({});
                    const [currentTheme, setCurrentTheme] = React.useState("Default (SteamOS Holo)");
                    const [showInitialWarning, setShowInitialWarning] = React.useState(true);

                    React.useEffect(async () => {
                        // Use localStorage to remember if the user has already been warned.
                        if (localStorage.getItem("borealisOS_initialWarning") === "true") {
                            setShowInitialWarning(false);
                        }

                        // Fetch current themes from communicator.
                        window.borealisPush('getThemes').then(data => {
                            setThemes({default: {contents: "", meta: {name: "Default (SteamOS Holo)", author: "Valve"}}, ...data});
                        })

                        // Listen for theme changes.
                        await window.borealisPush('currentTheme').then(data => {
                            setCurrentTheme(data.name);
                        })
                    }, []);

                    const handleThemeChange = (theme) => {
                        window.borealisPush('setTheme', theme).then(data => {
                            setCurrentTheme(theme);
                        })
                    }

                    const handleWarningClose = () => {
                        setShowInitialWarning(false);
                        localStorage.setItem("borealisOS_initialWarning", "true");
                    }

                    return (
                        <div class="borealis_settings">
                            <div style={{textAlign: "center"}}>
                                <h1 style={{ marginBottom: "-15px", fontSize: "65px", fontWeight: "100", marginTop: "0px" }}>Borealis<span style={{ fontWeight: "500", marginBottom: "0px", position: "relative" }}>OS<span class="version" style={{position: "absolute", left: "95%", top: "0px", fontSize: "13px"}}>indev</span></span></h1>
                                <p style={{ fontWeight: "100", marginTop: "0px", fontSize: "15px" }}>SteamOS 3.0 plugin and customization framework</p>
                            </div>


                            {
                                showInitialWarning &&
                            <div
                            style={{
                              textAlign: "justify",
                              marginTop: "20px",
                              borderRadius: "10px",
                              boxShadow: "41px 41px 82px #06080b, -41px -41px 82px #16202b",
                              padding: "10px",
                              fontSize: "13px",
                              boxSizing: "border-box"
                            }}
                          >
                            <p>
                              BorealisOS is still currently under heavy development, there will be
                              bugs, breakages and all sorts. BorealisOS does not currently have support for Steam's Controller NavMap
                              system. This means that all Borealis Menus and UI will only work
                              with the touch screen for now.
                            </p>

                                <button onClick={handleWarningClose} class="DialogButton _DialogLayout Secondary gamepaddialog_Button_1kn70 Focusable">
                                    Ok, I understand.
                                </button>
                          </div>
                          }

                          <div className="DialogControlsSectionHeader">Plugins</div>


                          <div className="DialogControlsSectionHeader">Themes</div>

                          {Object.keys(themes).map(key => {
                            return (
                                <div className="gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_ExtraPaddingOnChildrenBelow_5UO-_ gamepaddialog_StandardPadding_XRBFu gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable">
                                    <div class="gamepaddialog_FieldLabelRow_H9WOq">
                                        <div class="gamepaddialog_FieldLabel_3b0U-">
                                            {themes[key].meta.name}
                                        </div>
                                        <div class="gamepaddialog_FieldChildren_14_HB" onClick={() => handleThemeChange(themes[key].meta.name)} >
                                            { currentTheme === themes[key].meta.name ?
                                                <div class="gamepaddialog_Toggle_24G4g gamepaddialog_On_3ld7T Focusable gpfocuswithin"><div class="gamepaddialog_ToggleRail_2JtC3"></div><div class="gamepaddialog_ToggleSwitch_3__OD"></div></div>
                                                :
                                                <div class="gamepaddialog_Toggle_24G4g  Focusable"><div class="gamepaddialog_ToggleRail_2JtC3"></div><div class="gamepaddialog_ToggleSwitch_3__OD"></div></div>
                                            }
                                        </div>
                                    </div>
                                    <div class="gamepaddialog_FieldDescription_2OJfk">Author: {themes[key].meta.author}</div>
                                </div>
                            )
                          })}

                          <div className="DialogControlsSectionHeader">Advanced</div>
                          <div class="gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_InlineWrapShiftsChildrenBelow_pHUb6 gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_StandardPadding_XRBFu gamepaddialog_Clickable_27UVY gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable" tabindex="0">
                            <div class="gamepaddialog_FieldLabelRow_H9WOq">
                                <div class="gamepaddialog_FieldLabel_3b0U-">BorealisOS Version</div>
                                <div class="gamepaddialog_FieldChildren_14_HB">
                                    <div class="gamepaddialog_LabelFieldValue_5Mylh">InDev</div>
                                </div>
                            </div>
                          </div>
                          <div class="gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_InlineWrapShiftsChildrenBelow_pHUb6 gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_StandardPadding_XRBFu gamepaddialog_Clickable_27UVY gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable" tabindex="0">
                              <div class="gamepaddialog_FieldLabelRow_H9WOq">
                                  <div class="gamepaddialog_FieldLabel_3b0U-">Hot Reloading</div>
                                  <div class="gamepaddialog_FieldChildren_14_HB">
                                      <div class="gamepaddialog_LabelFieldValue_5Mylh">True</div>
                                  </div>
                              </div>
                            </div>
                            <div class="gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_InlineWrapShiftsChildrenBelow_pHUb6 gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_StandardPadding_XRBFu gamepaddialog_Clickable_27UVY gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable" tabindex="0">
                                <div class="gamepaddialog_FieldLabelRow_H9WOq">
                                    <div class="gamepaddialog_FieldLabel_3b0U-">Service Installed</div>
                                    <div class="gamepaddialog_FieldChildren_14_HB">
                                        <div class="gamepaddialog_LabelFieldValue_5Mylh">False</div>
                                    </div>
                                </div>
                              </div>
                              <div class="gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_InlineWrapShiftsChildrenBelow_pHUb6 gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_StandardPadding_XRBFu gamepaddialog_Clickable_27UVY gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable" tabindex="0">
                              <div class="gamepaddialog_FieldLabelRow_H9WOq">
                                  <div class="gamepaddialog_FieldLabel_3b0U-">React Devtools Injected</div>
                                  <div class="gamepaddialog_FieldChildren_14_HB">
                                      <div class="gamepaddialog_LabelFieldValue_5Mylh">{window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'True' : 'False' }</div>
                                  </div>
                              </div>
                            </div>
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
