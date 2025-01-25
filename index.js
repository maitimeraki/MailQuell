const express = require("express");
const app = express();
const { google } = require("googleapis");
const fs = require("fs").promises;
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 8000;
// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
// Add logging middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session State:', req.session.oauthState);

  next();
});


const CREDENTIALS = require("./credentials.json");
const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Redirect for authentication
app.get("/auth", (req, res) => {
  try {

    // Add state parameter
    const state = Math.random().toString(36).substring(7);
    req.session.oauthState = state;
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ['https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/pubsub',  // Add PubSub scope
        'https://www.googleapis.com/auth/cloud-platform'],
      state: state,
      prompt: "consent"
    });
    console.log("Auth initiated with state:", state);
    res.redirect(authUrl);
  } catch (e) {
    console.error("Auth error:", e);
    res.status(500).send("Authentication failed");
  }
});

// Callback handler
app.get("/auth/google/callback", async (req, res) => {
  try {
    if (!req.session.oauthState) {
      throw new Error("No state in session");
    }
    // Verify state parameter
    if (req.query.state !== req.session.oauthState) {
      console.error("State mismatch");
      return res.status(400).send("Invalid state parameter");
    }
    console.log("Authorization code received:", req.query.code); // Log the received code
    const { tokens } = await oAuth2Client.getToken(req.query.code);

    // Check if a refresh token is included and handle it
    if (tokens.refresh_token) {
      console.log("Save the refresh token:", tokens.refresh_token);
      // Save the refresh token (e.g., in a database or file)
      // process.env.USER_REFRESH_TOKEN = tokens.refresh_token;
    }

    oAuth2Client.setCredentials(tokens);

    console.log("Tokens received:", tokens); // Log the received tokens
    // Save tokens to file
    await fs.writeFile("token.json", JSON.stringify(tokens));

    res.redirect('/watch');
    // Clear state after use
    delete req.session.oauthState;
    req.session.save();
    // res.send("Authentication successful! You can close this tab.");
  } catch (error) {
    console.error('Auth Error:', error.response);
    res.status(400).send(error.message);
  }
});
// app.get("/success", (req, res) => {
//   res.send("Authentication successful! You can close this tab.");
// });
// Watch Gmail function
async function watchGmail(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  try {
    const response = await gmail.users.watch({
      userId: "anupammaiti10@gmail.com",
      requestBody: {
        labelIds: ["INBOX"],
        topicName: process.env.PUB_SUB_TOPIC_NAME
      },
    });
    console.log("Watch response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error setting up Gmail watch:", error);
    throw error;
  }

}
// Endpoint to initiate watching
app.get("/watch", async (req, res) => {
  try {
    // Load tokens from file
    const tokenData = await fs.readFile("token.json", "utf-8");
    const tokens = JSON.parse(tokenData);

    // Set credentials for oAuth2Client
    oAuth2Client.setCredentials(tokens);

    // Call the watch function
    const response = await watchGmail(oAuth2Client);
    res.send("Watch initiated successfully. History ID: " + response.historyId);
  } catch (error) {
    console.error("Error watching Gmail:", error.message);
    res.status(500).send("Failed to initiate watch.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${process.env.HOST}:${PORT}`);
});
