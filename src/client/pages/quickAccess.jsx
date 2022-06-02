export default (props) => {
  const React = window.SP_REACT

  return (
    <div className='quickaccessmenu_TabGroupPanel_1QO7b Panel Focusable'>
      <div className='quickaccesscontrols_PanelSection_Ob5uo'>

        {Object.keys(window.Borealis.plugins).map(key => {
          const plugin = window.Borealis.plugins[key]

          if (plugin.UI.quickAccessComponent) {
            return (
              <div>
                {plugin.UI.quickAccessComponent()}
              </div>
            )
          } else { return (<div />) }
        })}

      </div>
    </div>
  )
}
