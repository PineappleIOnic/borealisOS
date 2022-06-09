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
      dependencies: ['borealis-core'],
      config: [
        // Config is a list of variables that you want borealis to save persistently.
        // They will be automatically saved and loaded on initialisation and accessible through
        // this.config.variableName

        // Example:
        {
          name: 'spotify_client_id',
          type: 'string',
          default: '',
          description: 'Spotify Client ID'
        },
        {
          name: 'spotify_client_secret',
          type: 'string',
          default: '',
          description: 'Spotify Client Secret'
        },

        // You are also able to define buttons in the plugin settings.
        {
          name: 'spotify_login',
          type: 'button',
          description: 'Login to Spotify',
          callback: this.login // This will call this plugin's Login function.
        }
      ]
    }
  }

  async main () {
    // This is a main initialization thread for your plugin. You can do anything here.

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = 'TOKEN' // TODO: Implement authentication into settings page
      this.player = new window.Spotify.Player({
        name: 'Steam Deck',
        getOAuthToken: cb => { cb(token) },
        volume: 0.5
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

    if (!window.Spotify) {
      // Initialise Web Player
      const script = document.createElement('script')
      script.id = 'spotify-player'
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      document.head.appendChild(script)
    }

    this.UI.settingsPage = (props) => {
      const React = window.SP_REACT

      const authURL = new URL('https://accounts.spotify.com/authorize?')

      authURL.search = new URLSearchParams({
        client_id: 'bfb7ca6b2221490daf87ee9ea33b9c0a',
        response_type: 'code',
        redirect_uri: 'http://localhost:8080/callback',
        scope: 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'
      })

      // const [authenticated, setAuthenticated] = React.useState(false);

      const startAuth = () => {
        window.location.replace(authURL)
      }

      return (
        <div className='spotifySettingsPage'>
          <button onClick={startAuth} className='DialogButton' style={{ padding: '5px', borderRadius: '10px', marginBottom: '15px', background: '#1DB954', boxSizing: 'border-box' }}>Connect to Spotify</button>
        </div>
      )
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
          this.player.getCurrentState().then(state => {
            if (!state) { return }

            console.log(state)

            console.log((state.position / state.duration) * 100)

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
