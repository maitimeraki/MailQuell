const { google } = require("googleapis");
const deleteEmailsFromSender = require('../controllers/delFromSender'); 
const oAuth2Client = require('../controllers/oAuthClient');
// Helper function to extract email address
const extractEmail = (fullEmailString) => {
  const matches = fullEmailString.match(/<(.+?)>/);
  return matches ? matches[1] : fullEmailString;
};

module.exports.webHook = async (req, res) => {
  try {                                 
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messages = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX','UNREAD'],
      maxResults: 5
    });

    if (!messages.data.messages) {
      return res.status(200).send('No messages to process');
    }

    if (messages.data.messages && messages.data.messages.length > 0) {
      for (const message of messages.data.messages) {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = messageDetails.data.payload.headers;
        const fromHeader = headers.find(h => h.name === 'From')?.value;
        
        // Extract just the email address for comparison
        const senderEmail = extractEmail(fromHeader);
        console.log('Sender Email:', senderEmail); // Debug log

        // Compare with the target email
        if (senderEmail === 'maitianupam567@gmail.com') {
          const response = await deleteEmailsFromSender.deleteEmailsFromSender(fromHeader);
          console.log('Delete Response:', response);
        } else {
          console.log('Email not matched:', senderEmail);
        }
      }
    }
    // res.redirect('/dashboard');
    res.render('render')
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};