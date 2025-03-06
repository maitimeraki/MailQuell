const express = require('express');
const router =express.Router();
const { google } = require("googleapis");
const fs = require("fs").promises;      
const watchGmail=require('../controllers/watchGmail');
const oAuth2Client = require('../controllers/oAuthClient');
// Store active watches
let activeWatches = new Map();
// Function to process incoming emails
async function processIncomingEmails(auth) {
  try {
      const gmail = google.gmail({ version: 'v1', auth });
      
      // Get latest messages
      const messages = await gmail.users.messages.list({
          userId: 'me',
          labelIds: ['INBOX', 'UNREAD'],
          maxResults: 5
      });

      if (messages.data.messages) {
          for (const message of messages.data.messages) {
              const messageDetails = await gmail.users.messages.get({
                  userId: 'me',
                  id: message.id,
                  format: 'full'
              });

              const headers = messageDetails.data.payload.headers;
              const fromHeader = headers.find(h => h.name === 'From')?.value;
              
              // If email is from target sender, delete it
              if (fromHeader && fromHeader.includes('maitianupam567@gmail.com')) {
                  await gmail.users.messages.trash({
                      userId: 'me',
                      id: message.id
                  });
                  console.log(`Deleted email from ${fromHeader}`);
              }
          }
      }
  } catch (error) {
      console.error('Error processing emails:', error);
  }
}
// Function to maintain continuous watch
async function maintainWatch(auth, userId) {
  try {
      // Set up interval to check for new messages every minute
      const watchInterval = setInterval(async () => {
          await processIncomingEmails(auth);
      }, 60000); // Check every minute

      // Store the watch interval
      activeWatches.set(userId, watchInterval);

  } catch (error) {
      console.error('Watch maintenance error:', error);
  }
}
// Endpoint to initiate watching 
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
      await maintainWatch(oAuth2Client, userId);

      next();
  } catch (error) {
      console.error("Error watching Gmail:", error.message);
      res.status(500).send("Failed to initiate watch.");
  }
};
 // Cleanup function for when user logs out
module.exports.stopWatch = (userId) => {
  const watchInterval = activeWatches.get(userId);
  if (watchInterval) {
      clearInterval(watchInterval);
      activeWatches.delete(userId);
      console.log(`Stopped watching for user ${userId}`);
  }
};