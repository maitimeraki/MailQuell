const { google } = require('googleapis');
const addressSplit = require('../service/addressSplit.service');

// Utility to split email addresses from "From" header strings and process Gmail messages based on tags
module.exports.processIncomingEmailsWithHistory = async (auth, tags, lastHistoryId = null) => {
    try {
        console.log("Processing emails using history:", { tags, lastHistoryId });
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            console.log('No valid tags provided');
            return { processed: 0, moved: 0, historyId: lastHistoryId };
        }
        const normalizedTags = tags.map(tag => tag.toLowerCase().trim());
        const gmail = google.gmail({ version: 'v1', auth });

        let messagesToProcess = [];
        
        // Get new mail since last historyId
        if (lastHistoryId) {
            // Use history to get only new changes
            const history = await gmail.users.history.list({
                userId: 'me',
                startHistoryId: lastHistoryId,
                historyTypes: ['messageAdded']
            });

            if (history.data.history) {
                history.data.history.forEach(historyItem => {
                    if (historyItem.messagesAdded) {
                        historyItem.messagesAdded.forEach(added => {
                            if (added.message && added.message.labelIds?.includes('INBOX')) {
                                messagesToProcess.push(added.message);
                            }
                        });
                    }
                });
            }
            console.log(`History API found ${messagesToProcess.length} new messages`);
        } else {
            // First run - get current inbox
            const messages = await gmail.users.messages.list({
                userId: 'me',
                labelIds: ['INBOX'],
                maxResults: 20 // Smaller batch for first run
            });
            
            messagesToProcess = messages.data.messages || [];
            console.log(`First run - processing ${messagesToProcess.length} current messages`);
        }
        if (messagesToProcess.length === 0) {
            return { processed: 0, moved: 0, historyId: lastHistoryId };
        }

        const messagesToMove = [];
        const messageDetailsPromises = [];

        // Get details for all messages to process
        for (const message of messagesToProcess) {
            messageDetailsPromises.push(
                gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full'
                })
            );
        }

        const messageDetailsResults = await Promise.allSettled(messageDetailsPromises);
        for (let i = 0; i < messageDetailsResults.length; i++) {
            const result = messageDetailsResults[i];
            
            if (result.status === 'fulfilled') {
                const messageDetails = result.value;
                const headers = messageDetails.data.payload.headers;
                const fromHeader = headers.find(h => h.name === 'From')?.value || '';
                
                const target = addressSplit.addressSplit(fromHeader);
                
                if (target && Array.isArray(target)) {
                    const emailSet = new Set(target.map(email => email.toLowerCase()));
                    const isPresent = normalizedTags.some(tag => emailSet.has(tag));
                    
                    if (isPresent) {
                        messagesToMove.push(messagesToProcess[i].id);
                        console.log(`✅ Marked for removal: ${fromHeader}`);
                    }
                }
            }
        }
        // Batch process matching messages
        if (messagesToMove.length > 0) {
            await gmail.users.messages.batchModify({
                userId: 'me',
                requestBody: {
                    ids: messagesToMove,
                    removeLabelIds: ['INBOX'],
                    addLabelIds: ['TRASH']
                }
            });
            console.log(`✅ Batch moved ${messagesToMove.length} messages to trash`);
        }
        // // Get new history ID for next run
        // const profile = await gmail.users.getProfile({ userId: 'me' });
        // const newHistoryId = profile.data.historyId;
        // return {
        //     processed: messagesToProcess.length,
        //     moved: messagesToMove.length,
        //     historyId: newHistoryId
        // };
    } catch (error) {
        console.error('Error processing emails with history:', error);
        throw error;
    }
};