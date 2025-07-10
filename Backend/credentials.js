module.exports = {
  installed: {
    "client_id": process.env.GMAIL_CLIENT_ID,
    "project_id": process.env.GMAIL_PROJECT_ID,
    "auth_uri": process.env.GMAIL_AUTH_URI,
    "token_uri": process.env.GMAIL_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.GMAIL_AUTH_PROVIDER_X509_CERT_URL,
    "client_secret": process.env.GMAIL_CLIENT_SECRET,
    "redirect_uris": [process.env.GMAIL_REDIRECT_URI]
  }
}
