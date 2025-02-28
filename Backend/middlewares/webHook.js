const { google } = require("googleapis");
const deleteEmailsFromSender = require('../controllers/delFromSender'); 
const oAuth2Client = require('../controllers/oAuthClient');
module.exports.webHook=async (req, res) => {
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
          await deleteEmailsFromSender.deleteEmailsFromSender(Email.from);
          console.log(`Deleted emails from: ${Email.from}`);
        }
      }
    }
    // res.status(200).send('Notification processed');
    res.render('render')

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send(error.message);
  }
};