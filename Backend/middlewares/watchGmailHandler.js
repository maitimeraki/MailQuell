const fs = require("fs").promises;
const path = require("path");
const watchGmail = require("../controllers/watchGmail");
const oAuth2Client = require("../controllers/oAuthClient");
const {maintainWatch,activeWatches} =require("../utils/maintainWatch");
 
// const tagsControllers = require("../controllers/tags.controllers");
// const { updateTags, activeTags } = require("../service/updateTags");
// // Store active watches and their associated tags
// let activeWatches = new Map();


// Function to maintain continuous watch
// async function maintainWatch( auth, initialTags) {
//     try {
//         // Clear existing interval if any    
//         if (activeWatches.has(auth)) {
//             clearInterval(activeWatches.get(auth));
//             activeWatches.delete(auth);
//         }
//         // Store initial tags
//         updateTags(auth, initialTags);
//         // Create the interval
//         const watchInterval = setInterval(async () => {
//             try {
//                 const timestamp = new Date().toISOString();
//                 console.log(`Running check at ${timestamp}`);
//                 // let auth = req.cookies.Token;
//                 // console.log('Auth:', auth);
//                 // Get current tags for this auth
//                 const currentTags = activeTags.get(auth) || [];
//                 console.log('Current tags:', currentTags);
//                 if (currentTags.length > 0) {
//                     try {
//                         await tagsControllers.processIncomingEmails(auth, currentTags);
//                         console.log(`Completed check at ${timestamp}`);
//                     } catch (error) {
//                         if (error.message && (error.message.includes("invalid_grant") ||
//                             error.response?.data?.error === 'invalid_grant')) {
//                             console.log('Token expired, stopping watch interval');
//                         } else {
//                             console.error('Error processing token:', error);
//                         }
//                     }
//                 } else {
//                     console.log('No tags to process');
//                 }
//             } catch (error) {
//                 console.error('Watch interval error:', error);
//             }
//         }, 6000);
//         // Run first check immediately if we have tags
//         if (initialTags && initialTags.length > 0) {
//             await tagsControllers.processIncomingEmails(auth, initialTags);
//         }
//         // Store the watch interval
//         activeWatches.set(auth, watchInterval);
//         console.log('Watch interval set up successfully');
//     } catch (error) {
//         console.error('Watch maintenance error:', error);
//         throw error;
//     }
// }

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
