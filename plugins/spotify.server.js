const { default: axios } = require('axios')
const BorealisPluginServer = require('../src/borealisPlugin.server')
const logger = new (require('../src/libs/log'))('Plugin Engine', 'Spotify')
const params = new URLSearchParams()

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

    this.config = {
      spotify_client_id: process.env.SPOTIFY_CLIENT_ID,
      spotify_client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }

    this.communicator = communicator
  }

  async main () {
    // This is a main initialization thread for your plugin. You can do anything here.
    const express = require('express')

    const app = express()

    this.communicator.registerEventHook('spotifyRefreshToken', async (data) => {
      logger.info('Refreshing Spotify token...')

      const requestParams = new URLSearchParams()
      requestParams.append('grant_type', 'refresh_token')
      requestParams.append('refresh_token', data.refresh_token)

      try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', requestParams, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.spotify_client_id}:${this.config.spotify_client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`
          }
        })

        logger.info('Successfully authenticated with Spotify!')

        this.communicator.send('spotify_auth_success', {
          data_time: Date.now(),
          ...tokenResponse.data,
          ...profileResponse.data
        })
      } catch (err) {
        logger.error(`Failed to authenticate with Spotify!, Err: ${err}`)
        res.send('Authentication Failed. Check BorealisOS logs for this plugin.')
      }
    })

    app.get('/callback', async (req, res) => {
      logger.info('Recieved authentication code, attempting to auth...')

      const requestParams = new URLSearchParams()
      requestParams.append('grant_type', 'authorization_code')
      requestParams.append('code', req.query.code)
      requestParams.append('redirect_uri', 'http://localhost:27056/callback')

      try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', requestParams, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.spotify_client_id}:${this.config.spotify_client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        console.log(tokenResponse.data.access_token)

        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`
          }
        })

        logger.info('Successfully authenticated with Spotify!')

        this.communicator.send('spotify_auth_success', {
          data_time: Date.now(),
          ...tokenResponse.data,
          ...profileResponse.data
        })
        res.send('Authentication Successful, you can now close this page.')
      } catch (err) {
        logger.error(`Failed to authenticate with Spotify!, Err: ${err}`)
        res.send('Authentication Failed. Check BorealisOS logs for this plugin.')
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
