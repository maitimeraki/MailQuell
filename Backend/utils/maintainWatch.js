const tagsControllers = require("../controllers/tags.controllers");
const { updateTags, activeTags } = require("../service/updateTags");
// Store active watches and their associated tags
let activeWatches = new Map();
module.exports.maintainWatch = async (auth, initialTags) => {
    try {
        // Clear existing interval if any    
        if (activeWatches.has(auth)) {
            clearInterval(activeWatches.get(auth));
            activeWatches.delete(auth);
        }
        // Store initial tags
        updateTags(auth, initialTags);
        // Create the interval
        const watchInterval = setInterval(async () => {
            try {
                const timestamp = new Date().toISOString();
                console.log(`Running check at ${timestamp}`);
                // let auth = req.cookies.Token;
                // console.log('Auth:', auth);
                // Get current tags for this auth
                const currentTags = activeTags.get(auth) || [];
                console.log('Current tags:', currentTags);
                if (currentTags.length > 0) {
                    try {
                        await tagsControllers.processIncomingEmails(auth, currentTags);
                        console.log(`Completed check at ${timestamp}`);
                    } catch (error) {
                        if (error.message && (error.message.includes("invalid_grant") ||
                            error.response?.data?.error === 'invalid_grant')) {
                            console.log('Token expired, stopping watch interval');
                        } else {
                            console.error('Error processing token:', error);
                        }
                    }
                } else {
                    console.log('No tags to process');
                }
            } catch (error) {
                console.error('Watch interval error:', error);
            }
        }, 6000);
        // Run first check immediately if we have tags
        if (initialTags && initialTags.length > 0) {
            await tagsControllers.processIncomingEmails(auth, initialTags);
        }
        // Store the watch interval
        activeWatches.set(auth, watchInterval);
        console.log('Watch interval set up successfully');
    } catch (error) {
        console.error('Watch maintenance error:', error);
        throw error;
    }
}

module.exports.activeWatches = () => activeWatches;