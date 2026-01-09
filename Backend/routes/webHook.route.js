const express = require('express');
const router = express.Router();
const {gmailWebHooksHandler} = require('../webhooks/handlers/gmailWebhook');

// Route to handle Gmail webhooks
router.post('/gmail-webhook', gmailWebHooksHandler);

module.exports = router;