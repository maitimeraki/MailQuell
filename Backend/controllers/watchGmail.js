const { google } = require("googleapis");
const oAuth2Client = require('../controllers/oAuthClient');

// Watch Gmail function
module.exports.watchGmail = async (auth) => {
    const gmail = google.gmail({ version: "v1", auth:oAuth2Client });
    const topicName = `projects/${process.env.PROJECT_ID}/topics/${process.env.TOPIC_NAME}`;

    try {
        const response = await gmail.users.watch({
            userId: "me",
            requestBody: {
                labelIds: ["INBOX"],
                topicName: topicName,
            },
        });
        console.log("Watch response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error setting up Gmail watch:", error.response);
        throw error;
    }
}