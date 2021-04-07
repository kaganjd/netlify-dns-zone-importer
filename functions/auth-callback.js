const querystring = require('querystring')
const { config, client } = require('./utils/auth')
const NetlifyAPI = require('netlify')

/* Function to handle netlify auth callback */
exports.handler = async (event, context) => {
  // Exit early
  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Not authorized',
      })
    }
  }
  /* Grant the grant code */
  const code = event.queryStringParameters.code
  /* state helps mitigate CSRF attacks & Restore the previous state of your app */
  const state = querystring.parse(event.queryStringParameters.state)

  try {
    /* Take the grant code and exchange for an accessToken */
    const accessToken = await client.getToken({
      code: code,
      redirect_uri: config.redirect_uri,
      client_id: config.clientId,
      client_secret: config.clientSecret
    })
    const token = accessToken.token.access_token
    const ntl = new NetlifyAPI(token)
    const user = await ntl.getCurrentUser()
    const encodedUserData = querystring.stringify({
      email: user.email || "NA",
      full_name: user.full_name || "NA",
      avatar: user.avatar_url || "NA"
    })
    const URI = `${state.url}#${encodedUserData}&csrf=${state.csrf}&token=${Buffer.from(token, 'binary').toString('base64')}`
    console.log('URI', URI)
    /* Redirect user to authorizationURI */
    return {
      statusCode: 302,
      headers: {
        Location: URI,
        'Cache-Control': 'no-cache' // Disable caching of this response
      },
      body: ''
    }
  } catch (e) {
    console.log('Access Token Error', e.message)
    console.log(e)
    return {
      statusCode: e.statusCode || 500,
      body: JSON.stringify({
        error: e.message,
      })
    }
  }
}
