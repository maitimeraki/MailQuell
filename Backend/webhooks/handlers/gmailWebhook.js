const { gmailQueue } = require('../../queues/gmailQueue');

//Handles incoming POST requests from Google Pub/Sub
module.exports.gmailWebHooksHandler = async (req, res) => {
    try {
        const pubSubMessage = req.body.message;
        if (!pubSubMessage || !pubSubMessage.data) {
            console.error('Invalid Pub/Sub message format');
            return res.status(400).send('Invalid Format');
        }
        // 2. Decode the Base64 data string
        const decodedString = Buffer.from(pubSubMessage.data, 'base64').toString('utf-8');
        console.log('Decoded Pub/Sub message data:', JSON.stringify(decodedString));
        let payload;
        try {
            // Remove control characters and trim
            const sanitized = decodedString.replace(/[\x00-\x1F\x7F]/g, '').trim();
            payload = JSON.parse(sanitized);
        } catch (e) {
            console.log("Data is not JSON, treating as plain text:", decodedString);
            payload = decodedString;
        }

        console.log('Received Gmail webhook message:', payload);
        try {
            const { emailAddress, historyId } = payload;
            if (!emailAddress || !historyId) {
                console.error('Missing emailAddress or historyId in payload');
                return res.status(200).send('Missing Data');
            }
            // Add a job to the Gmail queue for processing
            await gmailQueue.add("process-gmail-notification", {
                emailAddress,
                historyId
            }, {
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 }
            }
            );

        }catch(err){
            console.error("Data is not in expected format:", err.message);
            return res.status(200).send('Different format');
        }
        return res.status(200).send('Notification Received');


    } catch (error) {
        console.error('Error handling Gmail webhook:', error.message);
        return res.status(500).send('Internal Server Error!');
    }
};