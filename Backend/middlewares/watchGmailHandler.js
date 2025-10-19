const fs = require("fs").promises;
const path = require("path");
const watchGmail = require("../controllers/watchGmail");
const oAuth2Client = require("../controllers/oAuthClient");
const {maintainWatch,activeWatches} =require("../utils/maintainWatch");

// Endpoint to initiate watching Gmail
module.exports.watchGmailHandler = async (req, res) => {
    try {
        // const tokenPath = path.join(__dirname, '..', 'token.json');
        const tokenData = req.session.token
        console.log('Token data:', tokenData);
        const tokens = JSON.parse(tokenData);
        
        oAuth2Client.setCredentials(tokens);
        // Validate tags from request body
        const tags = req.body.tags || [];
        // Set up initial watch    
        const response = await watchGmail.watchGmail(oAuth2Client);
        console.log('Watch initiated with historyId:', response.historyId);
        console.log(req.session.token);
        // Start continuous watching
        const userId = req.session.oauthState || 'default';
        console.log('Setting up watch for user:', userId);
        res.cookie("Token", tokens.access_token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        await maintainWatch( oAuth2Client, tags);

        // return res.redirect('/home');
    } catch (error) {
        console.error("Error watching Gmail:", error.message);
        res.status(500).send("Failed to initiate watch.");
    }
};


// Cleanup function for when user logs out
module.exports.stopWatchHandler = (userId) => {
  const watchInterval = activeWatches.get(userId);
  if (watchInterval) {
      clearInterval(watchInterval);
      activeWatches.delete(userId);
      console.log(`Stopped watching for user ${userId}`);
  }
};
