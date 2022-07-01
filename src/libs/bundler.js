/**
 * BorealisOS Webpack Bundler,
 * Used for compiling payloads on the fly.
 */
const webpack = require('webpack')
const { resolve } = require('path')
const fs = require('fs')

module.exports = class bundler {
  constructor () {
    const compileData = {
      version: require('../../package.json').version,
      platform: process.platform,
      arch: process.arch,
      hotReloading: !!process.argv.includes('--hot-reload'),
      environment: process.env.NODE_ENV || 'development',
      serviceInstalled: fs.existsSync('/etc/systemd/system/borealisOS.service')
    }

    this.webpackConf = {
      mode: 'development',
      entry: resolve('./src/client/borealisCore.js'),
      output: {
        path: resolve('./dist/'),
        filename: 'bundle.js'
      },
      plugins: [
        new webpack.DefinePlugin({
          COMPILE_DATA: JSON.stringify(compileData)
        }),
        new webpack.HotModuleReplacementPlugin()
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                envName: 'development',
                presets: [
                  '@babel/preset-react'
                ]
              }
            }
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    }

    this.webpack = webpack(this.webpackConf)
  }

  async bundle () {
    return new Promise((resolve, reject) => {
      this.webpack.run((err, stats) => {
        if (err) {
          return reject(err)
        }

        if (stats.hasErrors()) {
          return reject(stats.toString())
        }

        resolve()
      })
    })
  }
}
