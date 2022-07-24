const fetch = require('cross-fetch')
const BorealisPluginServer = require('../src/borealisPlugin.server')
const logger = new (require('../src/libs/log'))('Plugin', 'Spotify')

module.exports = class Spotify extends BorealisPluginServer {
  constructor (communicator) {
    super()
    this.pluginInfo = {
      name: 'Spotify',
      description: 'A Spotify integration for SteamOS',
      author: 'IOnicisere',
      version: '1.0.0',
      dependencies: ['borealis-core']
    }
    this.communicator = communicator
  }

  async main () {
    // This is a main initialization thread for your plugin. You can do anything here.
    const express = require('express')
    this.config.spotify_client_id = process.env.SPOTIFY_CLIENT_ID
    this.config.spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

    const app = express()

    this.communicator.registerEventHook('spotifyRefreshToken', async (data) => {
      logger.info('Refreshing Spotify token...')

      const requestParams = new URLSearchParams()
      requestParams.append('grant_type', 'refresh_token')
      requestParams.append('refresh_token', data.refresh_token)

      try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.spotify_client_id}:${this.config.spotify_client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: requestParams
        }).then(data => { if (data.ok) { return data.json() } else { throw new Error(data.json().error.message) } })

        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        }).then(data => { if (data.ok) { return data.json() } else { throw new Error(data.json().error.message) } })

        logger.info('Successfully authenticated with Spotify!')

        this.communicator.send('spotify_auth_success', {
          data_time: Date.now(),
          ...tokenResponse,
          ...profileResponse
        })
      } catch (err) {
        logger.error(`Failed to authenticate with Spotify!, Err: ${err}`)
        throw new Error('Authentication Failed. Did you remember to set your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables? Check your borealisOS logs for more info.')
      }
    })

    app.get('/callback', async (req, res) => {
      logger.info('Recieved authentication code, attempting to auth...')

      const requestParams = new URLSearchParams()
      requestParams.append('grant_type', 'authorization_code')
      requestParams.append('code', req.query.code)
      requestParams.append('redirect_uri', 'http://localhost:27056/callback')

      try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.spotify_client_id}:${this.config.spotify_client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: requestParams
        }).then(data => data.json())

        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        }).then(data => data.json())

        logger.info('Successfully authenticated with Spotify!')

        this.communicator.send('spotify_auth_success', {
          data_time: Date.now(),
          ...tokenResponse,
          ...profileResponse
        })
        res.send('Authentication Successful, you should get automatically redirected back to the settings menu in a moment.')
      } catch (err) {
        logger.error(`Failed to authenticate with Spotify!, Err: ${err}`)
        res.send('Authentication Failed. Did you remember to set your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables? Check your borealisOS logs for more info.')
      }
    })

    app.listen(27056, () => {
      logger.info('Launched Spotify Authentication Server!')
    })
  }

  async unload () {
    // Called when the plugin is unloaded or hot reloaded.
  }
}
