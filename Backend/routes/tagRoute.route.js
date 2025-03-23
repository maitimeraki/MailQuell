const express = require('express');
const router = express.Router();
const { processIncomingEmails} = require('../controllers/tags.controllers');

router.post('/processTags', async (req, res) => {
    try {
        const { tags } = req.body;
        // const auth = req.session.oauth2Client; // Assuming oauth2Client is stored in session
        
        // const result = await processIncomingEmails(auth, tags);
        
        res.json({
            success: true,
            message: 'Emails processed successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;