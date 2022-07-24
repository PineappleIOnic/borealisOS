/** global BorealisPlugin */

module.exports = class Spotify extends BorealisPlugin {
  // An Example Integration for BorealisOS
  constructor () {
    super()
    this.pluginInfo = {
      name: 'Spotify',
      description: 'A Spotify integration for SteamOS',
      author: 'IOnicisere',
      version: '1.0.0',
      dependencies: ['borealis-core']
    }
  }

  // Communication handler, called when a event for this plugin is recieved on client.
  // To send a event to a plugin from serverside make sure to prefix it with your
  // event name.

  // For instance, this plugin will recieve events with the `spotify_` prefix.
  async handleCommunication (event, data) {
    switch (event) {
      case 'spotify_auth_success':
        // Called when the user has successfully authenticated with Spotify
        this.login(data)
        history.back()
    }
  }

  async login (data) {
    if (data.error) {
      console.error(data.error)
      window.__BOREALIS__.notificationService.createNotification('Spotify', `An error occured while logging in, err: ${data["error_description"]}`, null, 5000)
      return
    }

    this.config.authenticationData = data

    // Reinitialise player with new auth data.
    this.authCB(this.config.authenticationData.access_token)
  }

  initialisePlayer () {
    if (this.config.authenticationData && this.config.authenticationData.data_time + this.config.authenticationData.expires_in * 1000 < Date.now()) {
      // Token has expired, refresh it.
      window.borealisPush('spotifyRefreshToken', this.config.authenticationData)
    }

    this.player = new window.Spotify.Player({
      name: 'Steam Deck',
      getOAuthToken: cb => {
        if (this.config.authenticationData) {
          cb(this.config.authenticationData.access_token)
        };

        this.authCB = cb
      },
      volume: 1
    })

    window.spotifyplayer = this.player

    // Ready
    this.player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)
    })

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
    })

    this.player.addListener('initialization_error', ({ message }) => {
      console.error(message)
    })

    this.player.addListener('authentication_error', ({ message }) => {
      console.error(message)
    })

    this.player.addListener('account_error', ({ message }) => {
      console.error(message)
    })

    this.player.connect()

    console.log('Spotify Web Player Initialized')
  }

  async main () {
    // This is a main initialization thread for your plugin.
    window.onSpotifyWebPlaybackSDKReady = this.initialisePlayer.bind(this)

    if (!window.Spotify) {
      // Initialise Web Player
      const script = document.createElement('script')
      script.id = 'spotify-player'
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      document.head.appendChild(script)
    }

    this.UI.settingsPage = (props) => {
      const React = window.SP_REACT

      const [, forceUpdate] = React.useReducer(x => x + 1, 0)

      const authURL = new URL('https://accounts.spotify.com/authorize?')

      authURL.search = new URLSearchParams({
        client_id: 'bfb7ca6b2221490daf87ee9ea33b9c0a',
        response_type: 'code',
        redirect_uri: 'http://localhost:27056/callback',
        scope: 'streaming user-read-email user-read-private',
        show_dialog: true
      })

      const startAuth = () => {
        window.location.replace(authURL)
      }

      const unlinkAccount = () => {
        this.config.authenticationData = null
        forceUpdate()
      }

      return <div className='spotifySettingsPage'>
          {!this.config.authenticationData && <button onClick={startAuth} className='DialogButton' style={{ padding: '5px', borderRadius: '10px', marginBottom: '15px', background: '#1DB954', boxSizing: 'border-box' }}>Connect to Spotify</button>}
          {this.config.authenticationData &&
            <div className='spotifySettingsPageProfile'>
              <h1>Linked Profile</h1>
              <div style={{ display: 'flex' }}><img src={this.config.authenticationData.images[0].url} style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '50px' }} />
                <div style={{ marginLeft: '10px' }}>
                  <h1 style={{ marginBottom: '0px', marginTop: '0px' }}>{this.config.authenticationData.display_name}</h1>
                  <p style={{ marginTop: '0px' }}>{this.config.authenticationData.id}</p>
                </div>
              </div>
              <button style={{ marginTop: '20px' }} onClick={unlinkAccount} class='DialogButton'>Unlink Account</button>
            </div>}
        </div>
    }

    const track = {
      name: 'No Song Playing',
      album: {
        images: [
          { url: '' }
        ]
      },
      artists: [
        { name: 'Connect to your Steam Deck using Spotify Connect' }
      ]
    }

    // Main Component
    this.UI.quickAccessComponent = (props) => {
      const React = window.SP_REACT

      const [is_paused, setPaused] = React.useState(false)
      const [is_active, setActive] = React.useState(false)
      const [current_track, setTrack] = React.useState(track)

      const [current_time_elapsed, setTimeElapsed] = React.useState(0) // Time elapsed as a percentage of 100%
      const [duration_interval, setDurationInteval] = React.useState(null)

      React.useEffect(() => {
        if (!this.player) {
          return
        }

        this.player.addListener('player_state_changed', state => {
          if (!state) {
            return
          }

          setTrack(state.track_window.current_track || {
            name: 'No Song Playing',
            album: {
              images: [
                { url: '' }
              ]
            },
            artists: [
              { name: 'Connect to your Steam Deck using Spotify Connect' }
            ]
          })
          setPaused(state.paused)

          this.player.getCurrentState().then(state => {
            (!state) ? setActive(false) : setActive(true)
          })
        })
      })

      React.useEffect(() => {
        setDurationInteval(setInterval(() => {
          if (!this.player) {
            return
          }

          this.player.getCurrentState().then(state => {
            if (!state) { return }
            setTimeElapsed((state.position / state.duration) * 100)
          })
        }, 500))

        return () => {
          clearInterval(duration_interval)
        }
      }, [])

      return (
        <div className='spotify_player'>
          <link
            href='https://fonts.googleapis.com/icon?family=Material+Icons'
            rel='stylesheet'
          />

          <div className='spotify_display' style={{ display: 'flex', padding: '5px', boxSizing: 'border-box' }}>
            <img
              src={current_track.album.images[0].url}
              className='now-playing__cover' style={{ width: '65px' }} alt=''
            />

            <div className='now-playing__side' style={{ marginLeft: '10px' }}>
              <div className='now-playing__name' style={{ fontWeight: 'bold', color: 'white' }}>{
                current_track.name
              }
              </div>

              <div className='now-playing__artist'>{
                current_track.artists[0].name
              }
              </div>
            </div>
          </div>
          <div className='time' style={{ marginTop: '5px', width: '95%', height: '5px', background: '#ffffff5e', margin: '5px auto', overflow: 'hidden', position: 'relative', borderRadius: '5px' }}>
            <div className='elapsed' style={{ position: 'absolute', left: '0px', top: '0px', height: '100%', background: 'white', width: `${current_time_elapsed}%` }} />
          </div>
          <div className='controls' style={{ display: 'flex' }}>
            <button onClick={() => { this.player.previousTrack() }} className='DialogButton _DialogLayout Secondary gamepaddialog_Button_1kn70 Focusable' style={{ flexGrow: '2', minWidth: '0px', margin: '5px' }}>
              <span className='material-icons'>skip_previous</span>
            </button>
            <button onClick={() => { this.player.togglePlay() }} className='DialogButton _DialogLayout Secondary gamepaddialog_Button_1kn70 Focusable' style={{ flexGrow: '2', minWidth: '0px', margin: '5px' }}>
              {is_paused ? (<span className='material-icons'>play_arrow</span>) : (<span className='material-icons'>pause</span>)}
            </button>
            <button onClick={() => { this.player.nextTrack() }} className='DialogButton _DialogLayout Secondary gamepaddialog_Button_1kn70 Focusable' style={{ flexGrow: '2', minWidth: '0px', margin: '5px' }}>
              <span className='material-icons'>skip_next</span>
            </button>
          </div>
        </div>
      )
    }
  }

  // Called when the plugin is unloaded or hot reloaded.
  async unload () {
    // Disconnect from Spotify
    this.player.disconnect()

    // Remove the Web Player
    window.Spotify = null

    // Remove the Web Player Script
    const script = document.getElementById('spotify-player')
    if (script) {
      script.remove()
    }

    // Settings page and quickAccess is automatically removed by Borealis on unload.
  }
}
