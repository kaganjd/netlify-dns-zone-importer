const { config, client } = require('./utils/auth')

/* Do initial auth redirect */
exports.handler = async (event, context) => {

  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'No token found',
      })
    }
  }

  const csrfToken = event.queryStringParameters.csrf
  const redirectUrl = event.queryStringParameters.url

  const authorizationURI = client.authorizeURL({
    redirect_uri: config.redirect_uri,
    scope: '',
    state: `url=${redirectUrl}&csrf=${csrfToken}`,
  })

  return {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache' // Disable caching of this response
    },
    body: ''
  }
}
