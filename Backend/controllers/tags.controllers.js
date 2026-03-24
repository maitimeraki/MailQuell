const { google } = require('googleapis');
const { addressSplit } = require('../service/addressSplit.service');
const { redisClient } = require('../config/redis');
const { addToSaveMailQueue } = require('../queues/saveMailToDb.queues');
const { getMailBody } = require('../utils/getMailBody');
const { compressAndEncryptOfBody } = require('../utils/CompressMail');

// Utility to split email addresses from "From" header strings and process Gmail messages based on tags
module.exports.processIncomingEmailsWithHistory = async (auth, tags, emailAddress, newHistoryId = null) => {
    try {
        // 1. Get the LAST processed historyId from storage
        let lastHistoryId = await redisClient.get(`gmail:history:${emailAddress}`);
        const normalizedTags = tags.map(tag => tag.toLowerCase().trim());
        const gmail = google.gmail({ version: 'v1', auth });
        console.log("Processing emails using history:", { tags, lastHistoryId, newHistoryId });
        if (!normalizedTags || !Array.isArray(normalizedTags) || normalizedTags.length === 0) {
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
        const docsToSave = [];

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
                // --Extract From --
                const fromHeader = headers.find(h => h.name === 'From')?.value || '';

                const target = addressSplit(fromHeader);

                if (target && Array.isArray(target)) {
                    const lowered = new Set(target.map(email => email.toLowerCase()));
                    const matchedRaws = normalizedTags.filter(t => lowered.has(t));
                    if (matchedRaws.length === 0) continue; // Skip if no tag matches
                    // --Extract Subject --
                    const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
                    // --Extract Body --
                    const emailBody = getMailBody(messageDetails?.data?.payload);
                    // -- Compressed body--
                    const compressedBody = compressAndEncryptOfBody(emailBody);

                    const senderEmail = target[target.length - 1] || ''; // Assuming the last element is the email address
                    const senderDomain = target?.slice(0, -1)?.join(' ');

                    
                    messagesToMove.push(messageDetails.data?.id);
                    console.log(`✅ Marked for removal: ${fromHeader}`);
                    
                    docsToSave.push({
                        owner: emailAddress,
                        threadId: messageDetails.data?.threadId || null,
                        gmailMessageId: messageDetails.data?.id,
                        senderEmail,
                        senderDomain,
                        subject: subjectHeader,
                        body: compressedBody,
                        receivedAt: messageDetails.data?.internalDate ? new Date(Number(messageDetails.data?.internalDate)) : new Date(),
                        processAt: new Date(),
                        // matchedTagInput: matchedRaws.map(m => m.tagInputId).filter(Boolean),
                        matchDetails: matchedRaws.map(m => ({
                            // tagInputId: m.tagInputId || null,
                            patternRaw: m,
                            reason: 'sender matched configured tag input'
                        })),
                        action: 'thrash' // keep aligned with your schema enum
                    });
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

            await addToSaveMailQueue({
                documents: docsToSave
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