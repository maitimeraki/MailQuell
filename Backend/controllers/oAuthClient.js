const { google } = require("googleapis");
const { auth} = require("google-auth-library");
// // Load credentials from file

const CREDENTIALS = require("../credentials");
const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;
if (!client_id || !client_secret || !redirect_uris[0]) {
  console.error('Missing Google OAuth env vars. Check GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI');
}
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

console.log('Configured redirect URI:', redirect_uris[0]);

module.exports = oAuth2Client;