const express = require('express');
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
// const { processIncomingEmails} = require('../controllers/tags.controllers');
const oAuth2Client = require("../controllers/oAuthClient");
const {updateTags}= require('../service/updateTags');
router.post('/processTags', async (req, res) => {
    try {
        const { tags } = req.body;
        console.log(req.sessionID)
        console.log("Received tags in route:", tags); // Debug log

        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tags format"
            });
        }
        const tokenData = await fs.readFile('../token.json', "utf-8");
        const tokens = JSON.parse(tokenData);

        oAuth2Client.setCredentials(tokens);
        const updated = updateTags(oAuth2Client, tags);
        console.log(updated);
 
        if (updated) {
            res.json({
                success: true,
                message: 'Tags updated successfully',
                tags: tags
            });
        } else {
            throw new Error('Failed to update tags');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;