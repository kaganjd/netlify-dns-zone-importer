import React, { Component } from 'react'
import NetlifyAPI from 'netlify'
import { csrfToken, parseHash, removeHash } from './utils/auth'
import loginButton from './assets/netlify-login-button.svg'
import './App.css'

export default class App extends Component {
  constructor(props, context) {
    super(props, context)
    console.log('window.location.hash', window.location.hash)
    const response = parseHash(window.location.hash)
    /* Clear hash */
    removeHash()

    /* Protect against csrf (cross site request forgery https://bit.ly/1V1AvZD) */
    if (response.token && !localStorage.getItem(response.csrf)) {
      alert('Token invalid. Please try to login again')
      return
    }

    /* Clean up csrfToken */
    localStorage.removeItem(response.csrf)

    /* Set initial app state */
    this.state = {
      user: response,
      zones: [],
      loading: false
    }
  }
  async componentDidMount() {
    const { user } = this.state
    if (!user.token) return

    /* Set request loading state */
    this.setState({
      loading: true
    })

    /* Fetch DNS zones from netlify API */
    const client = new NetlifyAPI(window.atob(user.token))
    const zones = await client.getDnsZones({
      filter: 'all'
    })

    /* Set sites and turn off loading state */
    this.setState({
      zones: zones,
      loading: false
    })
  }
  handleAuth = e => {
    e.preventDefault()
    const state = csrfToken()
    const { location, localStorage } = window
    /* Set csrf token */
    localStorage.setItem(state, 'true')
    /* Do redirect */
    const redirectTo = `${location.origin}${location.pathname}`
    window.location.href = `/.netlify/functions/auth-start?url=${redirectTo}&csrf=${state}`
  }
  handleLogout = e => {
    e.preventDefault()
    window.location.href = `/`
  }
  encode = data => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&")
  } 
  handleSubmit = e => {
    e.preventDefault()
    fetch('/', {
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data" },
      body: this.encode({
        "form-name": event.target.getAttribute("name"),
        ...name
      })
    })
    .then(() => console.log('Form successfully submitted'))
    .catch((error) => alert(error))
  }
  renderZoneFileInput = () => {
    return (
        <div className='zone-file-input' >
          <form method="post" name="zone-importer-with-ntl-form" id="z" data-netlify="true">
              <label>Zone file</label>
              <input type="file" name="zone" accept=".txt"/>
              <button className="primaryButton" onClick={this.handleSubmit}>
                Submit
              </button>
          </form>
        </div>
    )
  }

  renderZonesList = () => {
    const { zones, loading } = this.state

    if (loading) {
      return <div>Loading DNS zones...</div>
    }

    return zones.map((zone, i) => {
      const {
        account_slug,
        name,
        updated_at
      } = zone
      return (
        <div className='zone-wrapper' key={i}>
          <div className='zone-info'>
            <h2>
              <a href={`https://app.netlify.com/teams/${account_slug}/dns/${name}`} target='_blank' rel='noopener noreferrer'>
              {name}
              </a>
            </h2>
            <h3>
              updated at {updated_at}
            </h3>
          </div>
        </div>
      )
    })
  }
  render() {
    const { user } = this.state

    /* Not logged in. Show login button */
    if (user && !user.token) {
      return (
        <div className='app'>
          <h1>Netlify Zone File Uploader</h1>
          <button onClick={this.handleAuth} >
            <img alt='login to netlify' className='login-button' src={loginButton} />
          </button>
        </div>
      )
    }

    /* Show admin UI */
    return (
      <div className='app'>
        <h1>
          <span className='title-inner'>
            Hi {user.full_name || 'Friend'}
            <button className='primary-button' onClick={this.handleLogout}>
              Logout
            </button>
          </span>
        </h1>
        <div className='contents'>
          <div className='zone-wrapper-header'>
            <div className='zone-header header'>
              Zones
            </div>
          </div>
          {this.renderZoneFileInput()}
          {this.renderZonesList()}
        </div>
      </div>
    )
  }
}
