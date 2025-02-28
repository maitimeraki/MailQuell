const express = require('express');
const router =express.Router();
const { google } = require("googleapis");
const fs = require("fs").promises;      
const watchGmail=require('../controllers/watchGmail');
const oAuth2Client = require('../controllers/oAuthClient');

// Endpoint to initiate watching
 module.exports.watchGmailHandler=async (req, res,next) => {
    try {
      // Load tokens from file          
      const tokenData = await fs.readFile("../token.json", "utf-8");
      const tokens = JSON.parse(tokenData);
      // Set credentials for oAuth2Client
      oAuth2Client.setCredentials(tokens);
      // Call the watch function
      const response = await watchGmail.watchGmail(oAuth2Client);
      // res.send("Watch initiated successfully. History ID: " + response.historyId);
      next();
    } catch (error) {
      console.error("Error watching Gmail:", error.message);
      res.status(500).send("Failed to initiate watch.");
    }
  } ;
 