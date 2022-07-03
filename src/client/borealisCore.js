/*
Borealis Client, Clientside SteamOS customisation framework.
*/
import settingsPage from './pages/settingsPage.jsx'
import lambdaLogo from './assets/lambdaLogo.jsx'
import quickAccess from './pages/quickAccess.jsx'

if (window.Borealis) {
  window.Borealis.uninject()
}

const Borealis = class {
  constructor () {
    console.log('BorealisOS Client Initialised!')

    // Create our hook functions.
    window.__BOREALIS__ = {}
    window.__BOREALIS__.COMMUNICATE = this.handleCommunication.bind(this)
    window.__BOREALIS__.quickAccessHook = this.quickAccessHook.bind(this)
    window.__BOREALIS__.uninject = this.uninject.bind(this)

    this.hooks = {}
    this.serverData = {}
    this.plugins = []

    // Wait until webpack modules are loaded bebfore initialising hooks.
    if (!window.SP_REACT) {
      window.onload = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.hooks.backups = {
          createElement: window.SP_REACT.createElement,
          focusNav: window.FocusNavController.m_FocusChangedCallbacks.Register(this.focusNavControllerHook.bind(this))
        }
        window.SP_REACT.createElement = this.createElement.bind(this)
      }
    } else {
      this.hooks.backups = {
        createElement: window.SP_REACT.createElement,
        focusNav: window.FocusNavController.m_FocusChangedCallbacks.Register(this.focusNavControllerHook.bind(this))
      }
      window.SP_REACT.createElement = this.createElement.bind(this)
    }

    this.communicatorOnline = false

    if (window.borealisPush) {
      this.setCommunicatorOnline()
    }
  }

  async setCommunicatorOnline () {
    this.communicatorOnline = true

    console.log('Communicator Online. Requesting additional data...')

    const theme = await window.borealisPush('currentTheme')

    if (theme) {
      if (theme.name !== 'Default (SteamOS Holo)') {
        this.setTheme(theme.content)
      }
    }

    window.borealisPush('loadPlugins')
  }

  // Convert SteamUI Classes into Borealis ones.
  computeStyle (data) {
    const classes = data.split(' ')
    let result = ''

    classes.forEach(a => {
      for (const library in window.__BOREALISUI__) {
        for (const obj in window.__BOREALISUI__[library].classes) {
          if (window.__BOREALISUI__[library].classes[obj] === a) {
            result += `window.__BOREALISUI__.${library}.classes.${obj} `
          }
        }
      }
    })

    return result
  }

  handleCommunication (event, data) {
    console.log('Recieved Event: ' + event)

    switch (event) {
      case 'plugin': {
        this.handlePlugin(data)
      }
    }

    // Check if event corresponds to a plugin
    this.plugins.forEach(plugin => {
      if (event.toLowerCase().startsWith(plugin.pluginInfo.name.toLowerCase())) {
        plugin.handleCommunication(event, data)
      }
    })
  }

  handlePlugin (data) {
    console.log('Recieved Plugin Data.')

    const BorealisPlugin = require('./borealisPlugin.client.js').default // eslint-disable-line

    try {
      const module = {}

      eval(data.contents)

      const plugin = new module.exports()

      // Get config
      window.borealisPush('pluginConfigGet', plugin.pluginInfo.name).then(data => {
        plugin.config = new Proxy(data || {}, {
          set: function (target, key, value) {
            target[key] = value

            // Send Data to backend
            const data = {
              name: plugin.pluginInfo.name,
              key: key,
              value: value
            }
            window.borealisPush('pluginConfigSet', data)

            console.log(`Config object got updated. Result: ${target}`)
            return true
          }
        })

        plugin.main()

        console.log('Successfully Loaded Plugin: ' + plugin.pluginInfo.name)
        this.plugins.push(plugin)
      })
    } catch (e) {
      console.log('Failed to load plugin: ' + data.name)
      console.error(e)
    }
  }

  quickAccessHook (Q) {
    const React = window.SP_REACT

    Q.push({
      key: 7,
      panel: React.createElement(quickAccess),
      tab: React.createElement(lambdaLogo),
      title: React.createElement(() => (<div className='quickaccessmenu_Title_34nl5'>BorealisOS</div>))
    })
  }

  createElement () {
    const args = Array.prototype.slice.call(arguments)
    const borealisUI = window.__BOREALISUI__

    if (args[0] instanceof Function) {
      // Settings Hook
      if (args[0].toString().includes('GamepadPagedSettingsPage')) {
        console.log('Detected settings page. Hooking...')

        const React = window.SP_REACT

        args[2].props.pages.push('separator')

        args[2].props.pages.push({
          visible: true,
          title: 'BorealisOS',
          icon: React.createElement(lambdaLogo),
          route: '/settings/borealisOS',
          content: React.createElement(settingsPage)
        })
      }

      if (args[0].toString().includes('RemotePlayTogetherControls')) {
        console.log(args)
      }
    }

    return this.hooks.backups.createElement.apply(window.SP_REACT, args)
  }

  focusNavControllerHook () {
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

  findNavTree (element) {
    let finalResult = false

    function crawlTree (tree) {
      if (tree.m_element === element) {
        console.log(tree.m_element)
        return tree
      }

      if (tree.m_rgChildren) {
        for (let i = 0; i < tree.m_rgChildren.length; i++) {
          const result = crawlTree(tree.m_rgChildren[i])
          if (result) {
            return result
          }
        }
      }
    }

    window.FocusNavController.m_rgGamepadNavigationTrees.forEach(tree => {
      const result = crawlTree(tree.Root)

      if (result) {
        finalResult = result
      }
    })

    return finalResult
  }

  setTheme (style) {
    // Check if we already have a theme enabled.
    if (document.getElementById('borealis_theme')) {
      document.getElementById('borealis_theme').innerHTML = style
    } else {
      const themeElement = document.createElement('style')
      themeElement.id = 'borealis_theme'
      themeElement.innerHTML = style
      document.body.appendChild(themeElement)
    }
  }

  removeTheme () {
    if (document.getElementById('borealis_theme')) {
      document.getElementById('borealis_theme').remove()
    }
  }

  uninject () {
    // Rollback React Hooks
    window.SP_REACT.createElement = this.hooks.backups.createElement

    // Unload all plugins
    this.plugins.forEach(plugin => {
      if (plugin.unload) {
        plugin.unload()
      }
    })

    this.hooks.backups.focusNav.Unregister()
    this.removeTheme()

    // Rewrite dirty hooks to do nothing, we can't remove them or else SteamOS crashes.
    window.__BOREALIS__.quickAccessHook = () => { }
    window.__BOREALIS__.COMMUNICATE = () => { }
  }
}

window.Borealis = new Borealis()
