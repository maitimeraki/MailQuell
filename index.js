const express = require("express");
const app = express();
const { google } = require("googleapis");
const fs = require("fs").promises;
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();
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
  console.log('Request URL:', req.url);
  next();
});

const PORT = process.env.PORT || 8000;

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
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      state: state,
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

    delete req.session.oauthState;
    req.session.save();
    res.send("Authentication successful! You can close this tab.");
    res.redirect('/success');
    // Clear state after use
  } catch (error) {
    console.error("Callback error:", error.response);
    res.status(500).send("Callback failed");
  }
});
app.get("/success", (req, res) => {
  res.send("Authentication successful! You can close this tab.");
});
// Watch Gmail function
async function watchGmail(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.watch({
    userId: "maitianupam567@gmail.com",
    requestBody: {
      labelIds: ["INBOX"],
      topicName: "projects/gmail-api-448311/topics/YOUR_TOPIC_NAME",
    },
  });
  console.log("Watch response:", response.data);
}

// Endpoint to initiate watching
app.get("/watch", async (req, res) => {
  try {
    await watchGmail(oAuth2Client);
    res.send("Watch initiated successfully.");
  } catch (error) {
    console.error("Error watching Gmail:", error);
    res.status(500).send("Failed to initiate watch.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${process.env.HOST}:${PORT}`);
});
