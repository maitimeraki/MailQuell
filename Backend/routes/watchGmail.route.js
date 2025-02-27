const express = require('express');
const router =express.Router();
const { google } = require("googleapis");
const watchGmail=require('../controllers/watchGmail');
const oAuth2Client = require('../controllers/oAuthClient');
const fs = require("fs").promises;
const deleteEmailsFromSender = require('../controllers/delFromSender');
// Endpoint to initiate watching
router.get("/watch", async (req, res) => {
    try {
      // Load tokens from file
      const tokenData = await fs.readFile("../token.json", "utf-8");
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

// Webhook endpoint to receive notifications
router.get('/webhook', async (req, res) => {
  try {
    // if (!(await verifyAuthentication())) {
    //   throw new Error('Authentication failed or expired');
    // }
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Get the latest message
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20 //Limit to the latest message
    });
    // console.log(messages);
    if (!messages.data.messages) {
      return res.status(200).send('No messages to process');
    }
    if (messages.data.messages && messages.data.messages.length > 0) {
      for (const message of messages.data.messages) {

        // Get message details
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
    
        // Extract email details
        const headers = messageDetails.data.payload.headers;
         
        const Email = {
          subject: headers.find(h => h.name === 'Subject')?.value,
          from: headers.find(h => h.name === 'From')?.value,
        }
        // Add this check before deleting emails
        if (Email.from === "Anupam Maiti <maitianupam567@gmail.com>") {
          await deleteEmailsFromSender(Email.from);
          console.log(`Deleted emails from: ${Email.from}`);
        }
      }
    }
    res.status(200).send('Notification processed');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send(error.message);
  }
});

module.exports=router;