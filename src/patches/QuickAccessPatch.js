const BorealisPatch = require('../borealisPatch')
const fs = require('fs')
const { Parser } = require('acorn')
const walk = require('acorn-walk')

module.exports = class QuickAccessPatch extends BorealisPatch {
  constructor () {
    super()
    this.name = 'QuickAccessPatch'
    this.patchFiles = [
      'steamui/sp.js'
    ]
  }

  getPatchFiles () {
    return this.patchFiles
  }

  patch (file) {
    // Run patches...
    let fileData = fs.readFileSync(file).toString()

    // Utilise AST to detect and replace the function call, it's slower but it should be more reliable through updates.
    const AST = Parser.parse(fileData, {
      sourceType: 'module',
      ecmaVersion: 'latest'
    })

    let result = null

    walk.fullAncestor(AST, (node, _state, ancestors) => {
      try {
        if (node.value.type === 'Literal' && node.key.name === 'locId' && node.value.value === '#QuickAccess_Tab_Notifications_Title') {
          // Walk back to the parent node
          ancestors.forEach(node => {
            if (node.type === 'VariableDeclaration') {
              result = node
            }
          })
        }
      } catch {

      }
    })

    if (!result) {
      console.log('Failed to detect and patch Quick Access functions! Please File a bug report if this keeps occouring!')
    }

    const hookFunc = `window.__BOREALIS__.quickAccessHook(${result.declarations[1].id.name});`

    fileData = fileData.slice(0, result.end) +
    hookFunc +
    fileData.slice(result.end, fileData.length)

    // Also add borealis modified tag.
    fileData = '/* BOREALIS MODIFIED */' + fileData

    // Write fileData.
    fs.writeFileSync(file, fileData)
  }
}
