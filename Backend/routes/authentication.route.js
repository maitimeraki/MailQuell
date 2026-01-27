const express = require('express');
const router = express.Router();
const oAuth2Client = require('../controllers/oAuthClient');
// Redirect for authentication     
const crypto = require('crypto');
const { redisClient } = require("../config/redis");
const fs = require("fs").promises;

// const { auth } = require("google-auth-library");
// const { autoLogin } = require("../middlewares/autoLogin");
// const watchGmailHandler = require("../middlewares/watchGmailHandler");
router.get("/auth", async (req, res) => {
  try {

    // Add state parameter to prevent CSRF attacks
    // const state = Math.random().toString(36).substring(7);
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    req.session.save((err)=>{
      if(err){
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session error" });
      }
    })
    // delete req.session.string; // Clear any existing tokens
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
    res.cookie("auth_token", JSON.stringify(tokens.access_token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false for local dev
      sameSite: "lax",  // helps prevent CSRF
      maxAge: tokens.expiry_date ? tokens.expiry_date - Date.now() : 3600000 // expiry
    });
    req.session.token = JSON.stringify(tokens);

    // Optional: also store under token:<sessionID> for quick lookup (same TTL as session)
    if (redisClient && typeof redisClient.hSet === 'function') {
      await redisClient.hSet(`token:${req.sessionID}`, {...tokens}, { EX: 24 * 3600 });
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session error" });
      }
      console.log("logged in successfully!");
      return res.redirect(`${process.env.FRONTEND_URL}/mail`);    //res.location()
    });
    // next();
  } catch (error) {
    console.error("Auth Error:", error.response);
    res.status(400).send(error.message);
  }
});

module.exports = router;