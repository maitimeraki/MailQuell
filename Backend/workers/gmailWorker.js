const { Worker, Job } = require('bullmq');
const { google } = require("googleapis");
const { gmailQueue } = require('../queues/gmailQueue');
const { redisClient } = require('../config/redis');
const { getUserDetailsAndTaginputs } = require("../utils/getUserDetailsAndTaginputs");

// Fetch user data from the database and inputs tags for processing(also equivalent to aggregation approach)
/*async function getUserContext(emailAddress){
    const db = getdb();
    // 1. Fetch user by email address
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email : emailAddress.toLowerCase() });
    if(!user || !user.accessTokens){
        throw new Error(`No user or access tokens found for email: ${emailAddress}`);
    }
    // 2. Format tokens directly from the user object
    const tokens = {
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.accessTokenExpiresAt ? new Date(user.accessTokenExpiresAt).getTime() : undefined,
    };
    // 3. Fetch tag inputs associated with the user's workspace
    const tagsCollection = db.collection("taginputs");
    const tagInputs = await tagsCollection.find({ createdBy: String(user.workspaceId)}).toArray();
    const tags = tagInputs.map(tagDoc => tagDoc.patternRaw);

    return { tokens, tags };
};*/


// Create a Worker to process jobs from the Gmail queue
const gmailWorker = new Worker("gmail-notifications", async (job:Job) => {
    // Job processing logic will be implemented here
    console.log(`Processing job ${job.id} of type ${job.name} with data:`, job.data);
    const { emailAddress, historyId } = job.data;
    if (!emailAddress || !historyId) {
        throw new Error('Missing emailAddress or historyId in job data!');
    }
    const { tokens, tags } = getUserDetailsAndTaginputs(emailAddress);
    if (!tokens || !tags) {
        throw new Error(`Missing tokens or tags for email(by aggregation): ${emailAddress}`);
    }

    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials(tokens);

    const { processIncomingEmailsWithHistory } = require("../controllers/tags.controllers");
    const result = await processIncomingEmailsWithHistory(oAuth2Client, tags, historyId);
    console.log(`Job ${job.id} completed. Processed: ${result.processed}, Moved: ${result.moved}, New HistoryId: ${result.historyId}`);
    return result;

},{
    connection:redisClient,
    concurrency: 5,  //Process 50 users at once (Parallel processing)
    limiter: {
        max: 20,      // Max 100 jobs...
        duration: 1000 // ...per 1 second (Prevents hitting Google API Quota limits)
    }
});

// Event Listeners for Monitoring
gmailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} for ${job.data.email} has completed!`);
});

gmailWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete.`);
});

gmailWorker.on('failed',(job,err)=>{
    console.log(`Job ${job.id} has failed with error: ${err.message}`);
})

module.exports = { gmailWorker };