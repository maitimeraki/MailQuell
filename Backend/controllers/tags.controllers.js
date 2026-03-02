const { google } = require('googleapis');
const { addressSplit } = require('../service/addressSplit.service');
const { redisClient } = require('../config/redis');
const { addToSaveMailQueue } = require('../queues/saveMailToDb.queues');

// Utility to split email addresses from "From" header strings and process Gmail messages based on tags
module.exports.processIncomingEmailsWithHistory = async (auth, tags, emailAddress, newHistoryId = null) => {
    try {
        // 1. Get the LAST processed historyId from storage
        let lastHistoryId = await redisClient.get(`gmail:history:${emailAddress}`);
        const normalizedTags = tags.map(tag => tag.toLowerCase().trim());
        const gmail = google.gmail({ version: 'v1', auth });
        console.log("Processing emails using history:", { tags, lastHistoryId, newHistoryId });
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            console.log('No valid tags provided');
            return { processed: 0, moved: 0, historyId: lastHistoryId };
        }

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
                            if (added.message && added.message.id) {
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
            return { processed: 0, moved: 0, historyId: newHistoryId };
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

                const target = addressSplit(fromHeader);

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
            let listOfSenderEmails = [];
            listOfSenderEmails = messagesToMove.map(id => {
                    const details = messageDetailsResults.find(r => r.status === 'fulfilled' && r.value.data.id === id);
                    const fromHeader = details?.value?.data?.payload?.headers?.find(h => h.name === 'From')?.value || '';
                    const target = addressSplit(fromHeader);
                    return Array.isArray(target) && target.length > 0 ? target[0] : null;
                }).filter(email => email !== null);
            
            await addToSaveMailQueue({
                owner: emailAddress,
                gmailMessageId: messagesToMove,
                senderEmail: listOfSenderEmails,
                matchedTagInput: normalizedTags

            });
            console.log(`✅ Batch moved ${messagesToMove.length} messages to trash`);
        }
        // 4. Update stored historyId to NEW value
        await redisClient.set(`gmail:history:${emailAddress}`, newHistoryId);
        return {
            processed: messagesToProcess.length,
            moved: messagesToMove.length,
            historyId: newHistoryId
        };
    } catch (error) {
        console.error('Error processing emails with history:', error);
        throw error;
    }
};