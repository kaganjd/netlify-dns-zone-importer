import React, { Component } from 'react'
import NetlifyAPI from 'netlify'
import { csrfToken, parseHash, removeHash } from './utils/auth'
import loginButton from './assets/netlify-login-button.svg'
import './App.css'
import ZoneForm from './ZoneForm';

export default class App extends Component {
  constructor(props, context) {
    super(props, context)
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
      accountSlug: '',
      user: response,
      loading: false,
      zones: []
    }
  }
  async componentDidMount() {
    const { user } = this.state
    if (!user.token) return

    this.setState({
      loading: true
    })

    const client = new NetlifyAPI(window.atob(user.token))
    const zones = await client.getDnsZones({
      filter: 'all'
    })
    const accounts = await client.listAccountsForUser()
    
    this.setState({
      accountSlug: accounts[0].slug,
      loading: false,
      zones: zones
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
  render() {
    const { user, accountSlug } = this.state

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
          <ZoneForm accountSlug={accountSlug} user={user} />
        </div>
      </div>
    )
  }
}
