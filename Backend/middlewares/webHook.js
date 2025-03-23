const { google } = require("googleapis");
const { processEmailsByTags } = require('../controllers/tags.controllers');
const oAuth2Client = require('../controllers/oAuthClient');

module.exports.webHook = async (req, res, next) => {
  try {                                 
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Get stored tags from session or database
    const tags = req.session.tags || [];

    if (tags.length === 0) {
      console.log('No tags found to process');
      return res.redirect('/dashboard');
    }

    const messages = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX', 'UNREAD'],
      maxResults: 5
    });

    if (!messages.data.messages) {
      return res.redirect('/dashboard');
    }

    // Process messages based on tags
    for (const message of messages.data.messages) {
      const messageDetails = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = messageDetails.data.payload.headers;
      const fromHeader = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const body = messageDetails.data.snippet || '';
      const userde={
        fromHeader,
        subject,
        body
      }
      console.log("User Details:",userde);
      
      // Check if any tag matches
      const matchedTag = tags.find(tag => 
        fromHeader.toLowerCase().includes(tag.toLowerCase()) ||
        subject.toLowerCase().includes(tag.toLowerCase()) ||
        body.toLowerCase().includes(tag.toLowerCase())
      );

      if (matchedTag) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: {
            removeLabelIds: ['INBOX', 'UNREAD']
          }
        });
        console.log(`Processed email matching tag: ${matchedTag}`);
      }
    }

    return res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};