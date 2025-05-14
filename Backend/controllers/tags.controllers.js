const { google } = require("googleapis");
const addressSplit = require('../service/addressSplit.service');

module.exports.processIncomingEmails = async (auth, tags) => {
    try {
        // Debug logs
        console.log("Received auth:", !!auth);
        console.log(tags);
        console.log(Array.isArray(tags));
        // Validate tags parameter
        if (!tags || !Array.isArray(tags)) {
            console.error('Invalid tags format:', tags);
            throw new Error('No valid tags provided');
        }
        // Convert tags to lowercase for case-insensitive comparison
        const normalizedTags = tags.map(tag => tag.toLowerCase().trim());
        console.log("Normalized tags:", normalizedTags);
        const gmail = google.gmail({ version: 'v1', auth });

        // Get latest messages
        const messages = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ['INBOX'],
            maxResults: 5
        });
        if (!messages.data.messages || messages.data.messages.length === 0) {
            console.log("No messages found in inbox");
            return;
        }
        if (messages.data.messages) {
            for (const message of messages.data.messages) {
                const messageDetails = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full'
                });

                const headers = messageDetails.data.payload.headers;
                const fromHeader = headers.find(h => h.name === 'From')?.value || '';
                // Get email addresses from fromHeader
                const target = addressSplit.addressSplit(fromHeader);

                // Validate target array
                if (!target || !Array.isArray(target)) {
                    console.log('No valid email addresses found in:', fromHeader);
                    continue;
                }

                // Update the tag comparison logic
                const set = new Set(target.map(email => email.toLowerCase()));
                const isPresent = normalizedTags.some(tag => set.has(tag));
                console.log('Checking normalized tags:', normalizedTags);
                console.log('Against normalized addresses:', Array.from(set));
                console.log('Match found:', isPresent);

                if (isPresent) {
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: message.id,
                        requestBody: {
                            removeLabelIds: ['INBOX'],
                            addLabelIds: ['TRASH']
                        }
                    });
                    console.log(`Removed email from inbox: ${fromHeader}`);
                } else {
                    console.log(`Email from ${fromHeader} does not match any tags:`, tags);
                }
            }
        }
    } catch (error) {
        console.error('Error processing emails:', error);
        throw error; // Rethrow to handle in calling function
    }
};