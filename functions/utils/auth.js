const simpleOauth = require('simple-oauth2')

const SITE_URL = process.env.URL || 'http://localhost:3000'

/* Auth values */
const TOKEN_HOST = 'https://api.netlify.com'
const TOKEN_URL =  'https://api.netlify.com/oauth/token'
const USER_PROFILE_URL = 'https://api.netlify.com/api/v1/user'
const AUTHORIZATION_URL = 'https://app.netlify.com/authorize'
const REDIRECT_URL = `${SITE_URL}/.netlify/functions/auth-callback`

/* Env key name */
const clientIdKey = 'NETLIFY_OAUTH_CLIENT_ID'
const clientSecretKey = 'NETLIFY_OAUTH_CLIENT_SECRET'

const config = {
  clientId: process.env[clientIdKey],
  clientSecret: process.env[clientSecretKey],
  tokenHost: TOKEN_HOST,
  authorizePath: AUTHORIZATION_URL,
  tokenPath: TOKEN_URL,
  profilePath: USER_PROFILE_URL,
  redirect_uri: REDIRECT_URL,
}

  const client = new simpleOauth.AuthorizationCode({
    client: {
      id: config.clientId,
      secret: config.clientSecret
    },
    auth: {
      tokenHost: config.tokenHost,
      tokenPath: config.tokenPath,
      authorizePath: config.authorizePath
    }
  });

module.exports = {
  config: config,
  client: client
}
