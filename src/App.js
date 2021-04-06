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
      sites: [],
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

    /* Fetch sites from netlify API */
    const client = new NetlifyAPI(window.atob(user.token))
    const sites = await client.listSites({
      filter: 'all'
    })

    /* Set sites and turn off loading state */
    this.setState({
      sites: sites,
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
  renderSiteList = () => {
    const { sites, loading } = this.state

    if (loading) {
      return <div>Loading sites...</div>
    }

    let matchingSites = sites.filter(site => {
      return true
    })
    .map((site, i) => {
      const {
        name,
        account_slug,
        admin_url,
      } = site
      return (
        <div className='site-wrapper' key={i}>
          <div className='site-info'>
            <h2>
              <a href={admin_url} target='_blank' rel='noopener noreferrer'>
                {name}
              </a>
            </h2>
          </div>
          <div className='site-team'>
            <a
              href={`https://app.netlify.com/teams/${account_slug}/sites/`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {account_slug}
            </a>
          </div>
        </div>
      )
    })

    return matchingSites
  }
  render() {
    const { user } = this.state

    /* Not logged in. Show login button */
    if (user && !user.token) {
      return (
        <div className='app'>
          <h1>Netlify Site Search</h1>
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
          <div className='site-wrapper-header'>
            <div
              className='site-screenshot-header header'
              data-sort='name'
              onClick={this.handleSort}
              title='Click to sort by site name'
            >
              Site Info
            </div>
          </div>
          {this.renderSiteList()}
        </div>
      </div>
    )
  }
}
