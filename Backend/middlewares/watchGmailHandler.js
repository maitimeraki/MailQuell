const express = require('express');
const router =express.Router();
const { google } = require("googleapis");
const fs = require("fs").promises;      
const watchGmail=require('../controllers/watchGmail');
const oAuth2Client = require('../controllers/oAuthClient');
const tagsControllers=require('../controllers/tags.controllers');
// Store active watches
let activeWatches = new Map();

// const { deleteEmailsByTags } = require('../controllers/tags.controllers');
// async function processIncomingEmails(auth) {
//     try {
//         // Get tags from frontend via API endpoint
//         const response = await fetch('/api/tags');
//         const tags = await response.json();
        
//         // Process emails based on tags
//         await deleteEmailsByTags(auth, tags);
//     } catch (error) {
//         console.error('Error processing emails:', error);
//     }
// }

// Function to process incoming emails
// async function processIncomingEmails(auth,tags) {
//   try {
//       const gmail = google.gmail({ version: 'v1', auth });
      
//       // Get latest messages
//       const messages = await gmail.users.messages.list({
//           userId: 'me',
//           labelIds: ['INBOX', 'UNREAD'],
//           maxResults: 5
//       });

//       if (messages.data.messages) {
//           for (const message of messages.data.messages) {
//               const messageDetails = await gmail.users.messages.get({
//                   userId: 'me',
//                   id: message.id,
//                   format: 'full'
//               });

//               const headers = messageDetails.data.payload.headers;
//                 const subject = headers.find(h => h.name === 'Subject')?.value || '';
//                 const fromHeader = headers.find(h => h.name === 'From')?.value || '';
//                 const body = messageDetails.data.snippet || '';
//               // Check if any tag matches the email content
//               const shouldDelete = tags.some(tag => 
//                 subject.toLowerCase().includes(tag.toLowerCase()) ||
//                 fromHeader.toLowerCase().includes(tag.toLowerCase()) ||
//                 body.toLowerCase().includes(tag.toLowerCase())
//             );
//               // If email is from target sender, delete it
//               if (shouldDelete) {
//                 await gmail.users.messages.modify({
//                     userId: 'me',
//                     id: message.id,
//                     requestBody: {
//                         removeLabelIds: ['INBOX', 'UNREAD']
//                     }
//                 });
//                 console.log(`Removed email from inbox: ${fromHeader}`);
//             }
//           }
//       }
//   } catch (error) {
//       console.error('Error processing emails:', error);
//   }
// }

// Function to maintain continuous watch
async function maintainWatch(auth,tags) {
  try {
      // Set up interval to check for new messages every minute
    const watchInterval = setInterval(async () => {
        await tagsControllers.processIncomingEmails(auth,tags);
    }, 6000); // Check every minute

      // Store the watch interval
      activeWatches.set( auth, watchInterval );
    //   console.log(activeWatches);

  } catch (error) {
      console.error('Watch maintenance error:', error);
  }
}

// Endpoint to initiate watching Gmail
module.exports.watchGmailHandler = async (req, res, next) => {
  try {
      // const tokenPath = path.join(__dirname, '..', 'token.json');
      const tokenData = await fs.readFile('../token.json', "utf-8");
      const tokens = JSON.parse(tokenData);

      oAuth2Client.setCredentials(tokens);
      
      // Set up initial watch
      const response = await watchGmail.watchGmail(oAuth2Client);
      console.log('Watch initiated with historyId:', response.historyId);

      // Start continuous watching
      const userId = req.session.userId || 'default';
      console.log('User ID:', userId);
      await maintainWatch(oAuth2Client,req.body.tags);
      next();
  } catch (error) {
      console.error("Error watching Gmail:", error.message);
      res.status(500).send("Failed to initiate watch.");
  }
};

 // Cleanup function for when user logs out
// module.exports.stopWatch = (userId) => {
//   const watchInterval = activeWatches.get(userId);
//   if (watchInterval) {
//       clearInterval(watchInterval);
//       activeWatches.delete(userId);
//       console.log(`Stopped watching for user ${userId}`);
//   }
// };