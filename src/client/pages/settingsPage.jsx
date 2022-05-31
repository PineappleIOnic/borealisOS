export default (props) => {
    const React = window.SP_REACT;
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