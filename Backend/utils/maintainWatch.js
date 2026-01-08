const tagsControllers = require("../controllers/tags.controllers");
const { updateTags, activeTags } = require("../service/updateTags");
// Store active watches and their associated tags
let activeWatches = new Map();

module.exports.maintainWatch = async (auth) => {
    try {
        if (activeWatches.has(auth)) {
            clearInterval(activeWatches.get(auth).interval);
            activeWatches.delete(auth);
        }

        const processTags = await updateTags(auth);

        let isProcessing = false;
        let consecutiveErrors = 0;
        let lastHistoryId = null;

        // Get initial history ID
        try {
            const gmail = google.gmail({ version: 'v1', auth });
            const profile = await gmail.users.getProfile({ userId: 'me' });
            lastHistoryId = profile.data.historyId;
            console.log(`Initial history ID: ${lastHistoryId}`);
        } catch (error) {
            console.log('Could not get initial history ID, will use   fallback method');
        }

        const watchInterval = setInterval(async () => {
            if (isProcessing) {
                console.log('Previous process still running, skipping...');
                return;
            }
            try {
                isProcessing = true;
                const currentTags = activeTags.get(auth) || [];
                
                if (currentTags.length > 0) {
                    const result =  await tagsControllers.processIncomingEmails(
                        auth, currentTags, lastHistoryId
                    );
                    
                    if (result.historyId) {
                        lastHistoryId = result.historyId;
                    }
                    
                    console.log(`✅ Check completed: ${result.processed} processed, ${result.moved} moved`);
                    consecutiveErrors = 0;
                } else {
                    console.log('No tags to process in maintainwatch');
                }
            } catch (error) {
                consecutiveErrors++;
                console.error('Watch interval error:', error.message);
                
                if (consecutiveErrors >= 3) {
                    console.log('🔄 Falling back to basic processing due to errors');
                    // Fallback to basic processing without history
                    const result =  await tagsControllers.processIncomingEmails(auth, currentTags);
                    console.log(`✅ Fallback processed: ${result.moved} moved`);
                }
                
                if (consecutiveErrors >= 5) {
                    console.log('🔴 Too many errors, stopping watch');
                    clearInterval(watchInterval);
                    activeWatches.delete(auth);
                }
            } finally {
                isProcessing = false;
            }
        }, 15000); // Increased to 15s since we're only processing new messages

        // Store watch state
        activeWatches.set(auth, {
            interval: watchInterval,
            tags: processTags,
            lastHistoryId: lastHistoryId,
            lastRun: new Date()
        });

        // Initial processing
        if (processTags && processTags.length > 0) {
             await tagsControllers.processIncomingEmails(auth, processTags);
        }

        console.log('✅ Efficient watch interval set up successfully');
        
    } catch (error) {
        console.error('Watch maintenance error:', error);
        throw error;
    }
};

module.exports.activeWatches = () => activeWatches;