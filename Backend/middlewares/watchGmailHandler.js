const fs = require("fs").promises;
const { google } = require("googleapis");
const watchGmail = require("../controllers/watchGmail");
const oAuth2Client = require("../controllers/oAuthClient");
// const { maintainWatch, activeWatches } = require("../utils/maintainWatch");
const { profileData } = require('../service/profileData')



// const activeWatchers = activeWatches();
let watchInfo = new Map();
// Endpoint to initiate watching Gmail
module.exports.watchGmailHandler = async (req, res) => {
    try {
        const tokenData = req.session?.token;
        console.log('Token data:', tokenData);
        const tokens = JSON.parse(tokenData);
        // Fetch the profile data to stored in the form of map(key,value)
        const profile = await profileData(req, res);
        const profileInformation = { ...profile };
        console.log("Profile Information in watchGmailHandler:", profileInformation?.sub);
        const credentials = profileInformation?.sub;
        oAuth2Client.setCredentials(tokens);
        // Validate tags from request body
        // const tags = req.body.tags || [];
        // Set up initial watch
        const response = await watchGmail.watchGmail(oAuth2Client);
        console.log('Watch initiated with historyId:', response);
        watchInfo.set(credentials, response);
        // Start continuous watching
        const userId = req.session.oauthState || 'default';
        console.log('Setting up watch for user:', userId);
        res.cookie("Token", tokens.access_token, {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        // await maintainWatch(oAuth2Client);

    } catch (error) {
        console.error("Error watching Gmail:", error.message);
        res.status(500).send("Failed to initiate watch.");
    }
};


// Cleanup function for when user logs out
module.exports.stopWatchHandler = async (req,res) => {
    try{
        const tokenData = req.session?.token;
        console.log('Token data:', tokenData);
        const tokens = JSON.parse(tokenData);
        oAuth2Client.setCredentials(tokens);
        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
        await gmail.users.stop({
            userId: "me",
        });
        console.log("Gmail watch stopped successfully for user:");
        return true;
    }catch(err){
        console.error("Error in stopWatchHandler:", err);
            throw err;
    }
};

module.exports.watchInfoFunction = async () => await watchInfo
