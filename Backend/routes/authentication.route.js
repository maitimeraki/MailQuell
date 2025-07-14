const express = require('express');
const router = express.Router();
const oAuth2Client = require('../controllers/oAuthClient');
// Redirect for authentication     
const { google } = require("googleapis");
const fs = require("fs").promises;
const { auth } = require("google-auth-library");
const watchGmailHandler = require("../middlewares/watchGmailHandler");
router.get("/auth", (req, res) => {
  try {               
    
    // Add state parameter                 
    const state = Math.random().toString(36).substring(7);
    req.session.oauthState = state; 
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",                     
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/pubsub',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email openid'
      ],
      state: state,
      prompt: "consent",
      include_granted_scopes: true
    });

    // Check if user has accepted ToS
    // if (!req.session.tosAccepted) {
    //   return res.redirect('/terms.html?redirect=' + encodeURIComponent(authUrl));
    // }

    console.log("Auth initiated with state:", state);
    req.session.save(); 
    res.redirect(authUrl);
  } catch (e) {
    console.error("Auth error:", e);
    res.status(500).send("Authentication failed");
  }
});

// // Add ToS acceptance endpoint
// router.post("/accept-tos", (req, res) => {
//   req.session.tosAccepted = true;
//   res.json({ success: true });
// });

// Callback handler
router.get("/auth/google/callback", async (req, res, next) => {
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
    }
    // Set tokens to the client    
    oAuth2Client.setCredentials(tokens);
    console.log("Tokens received:", oAuth2Client?.credentials); // Log the received tokens
    // Save tokens to file
    // await fs.writeFile("../token.json", JSON.stringify(tokens));
    req.session.token=JSON.stringify(tokens);
    req.session.save();                      
    next();

  } catch (error) {
    console.error('Auth Error:', error.response);
    res.status(400).send(error.message);
  }
}, watchGmailHandler.watchGmailHandler);

module.exports = router;