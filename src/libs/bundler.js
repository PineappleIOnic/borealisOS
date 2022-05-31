/**
 * BorealisOS Webpack Bundler,
 * Used for compiling payloads on the fly.
 */
const webpack = require('webpack');
const { resolve } = require('path');

module.exports = class bundler {
    constructor() {
        this.webpack = webpack({
            mode: "development",
            entry: resolve("./src/client/borealisCore.js"),
            output: {
                path: resolve("./dist/"),
                filename: "bundle.js"
            },
            module: {
                rules: [
                    {
                      test: /\.jsx?$/,
                      exclude: /node_modules/,
                      use: {
                        loader: "babel-loader",
                        options: {
                          envName: "development",
                          presets: [
                              '@babel/preset-react'
                          ]
                        }
                      }
                    }
                ]
            },
            resolve: {
                extensions: [".js", ".jsx"]
            }
        });
    }

    async bundle() {
        return new Promise((resolve, reject) => {
            this.webpack.run((err, stats) => {
                if (err) {
                    return reject(err);
                }

                if (stats.hasErrors()) {
                    return reject(stats.toString());
                }

                resolve();
            });
        });
    }
}