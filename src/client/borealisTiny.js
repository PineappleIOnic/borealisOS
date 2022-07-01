/* A tiny version of borealisCore used mainly for theme injection on non-SP tabs */

if (window.Borealis) {
  window.Borealis.uninject()
}

Borealis = class {
  constructor() {
    console.log('BorealisT Client Initialised!')

    this.communicatorOnline = false

    if (window.borealisPush) {
      this.setCommunicatorOnline()
    }
  }

  async setCommunicatorOnline() {
    this.communicatorOnline = true

    const theme = await window.borealisPush('currentTheme')

    if (theme) {
      if (theme.name !== 'Default (SteamOS Holo)') {
        this.setTheme(theme.content)
      }
    }
  }

  setTheme(style) {
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

  removeTheme() {
    if (document.getElementById('borealis_theme')) {
      document.getElementById('borealis_theme').remove()
    }
  }

  uninject() {
    this.removeTheme()
  }
}

window.Borealis = new Borealis()
