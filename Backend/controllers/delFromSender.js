const { google } = require("googleapis");
const oAuth2Client = require('../controllers/oAuthClient');


 module.exports.deleteEmailsFromSender=async (senderEmail)=> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
      // Search for messages from specific sender
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${senderEmail}`,
        // maxResults: 20
      });
      if (response.data.messages && response.data.messages.length > 0) {
        for (const message of response.data.messages) {
          try {
            // First remove from inbox
            const email = await gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: {
                removeLabelIds: ['INBOX']
              }
            });
            // console.log(email);
        // Then permanently delete
            // await gmail.users.messages.delete({
            //   userId: 'me',
            //   id: message.id
            // });
  
            // console.log(`Successfully deleted message: ${message.id}`);
          } catch (err) {
            console.error(`Error processing message ${message.id}:`, err.message);
          }
        }
        return `Successfully deleted ${response.data.messages.length} messages from ${senderEmail}`;
      }
      return `No messages found from ${senderEmail}`;
    } catch (error) {
      console.error('Error deleting emails:', error);
      throw error;
    }
  }