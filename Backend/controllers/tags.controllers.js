const { google } = require("googleapis");

module.exports.processIncomingEmails = async (auth, tags) => {
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
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const fromHeader = headers.find(h => h.name === 'From')?.value || '';
                const body = messageDetails.data.snippet || '';
                const User={
                    sender: fromHeader,
                    subject: subject,
                    body: body
                }
                console.log("User Details:",User);
                // Check if any tag matches the email content
                const shouldDelete = tags.some(tag =>
                    subject.toLowerCase().includes(tag.toLowerCase()) ||
                    fromHeader.toLowerCase().includes(tag.toLowerCase()) ||
                    body.toLowerCase().includes(tag.toLowerCase())
                );
                // If email is from target sender, delete it
                if (shouldDelete) {
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: message.id,
                        requestBody: {
                            removeLabelIds: ['INBOX', 'UNREAD']
                        }
                    });
                    console.log(`Removed email from inbox: ${fromHeader}`);
                }
            }
        }
    } catch (error) {
        console.error('Error processing emails:', error);
    }
}