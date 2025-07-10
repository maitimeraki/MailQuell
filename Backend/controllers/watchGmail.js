const { google } = require("googleapis");
const oAuth2Client = require('../controllers/oAuthClient');

// Watch Gmail function
module.exports.watchGmail = async (auth) => {
    const gmail = google.gmail({ version: "v1", auth:auth });
    const topicName = `projects/${process.env.GMAIL_PROJECT_ID}/topics/${process.env.TOPIC_NAME}`;

    try {
        // First, stop any existing watch
        try {
            await gmail.users.stop({
                userId: 'me'
            });
        } catch (stopError) {
            console.log('No existing watch to stop');
        }

        // Set up new watch specifically for INBOX
        const response = await gmail.users.watch({
            userId: "me",
            requestBody: {
                labelIds: ["INBOX"], // This specifically targets INBOX
                labelFilterAction: "INCLUDE", // Only include specified labels
                topicName: topicName,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error setting up Gmail watch:", error.response);
        throw error;
    }
}