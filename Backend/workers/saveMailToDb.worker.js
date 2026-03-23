const { Worker } = require('bullmq');
const { redisClient } = require('../config/redis');
const { getdb } = require("../db/db");

// Create a Worker
const saveMailToDbWorkerHandler = async () => {
    const saveMailToDbWorker = new Worker("save-mail-to-db", async job => {
        // const { owner, gmailMessageId, senderEmail, matchedTagInput } = job.data;
        // if (!owner || !gmailMessageId || !senderEmail) {
        //     throw new Error('owner, gmailMessageId, senderEmail required');
        // }
        // console.log(`Worker processing job ${job.id} for owner ${owner} with gmailMessageId(s) ${gmailMessageId} and senderEmail(s) ${senderEmail}`);


        // // If gmailMessageId and senderEmail are arrays, create docs for each
        // let docs = [];
        // if (Array.isArray(gmailMessageId) && Array.isArray(senderEmail)) {
        //     for (let i = 0; i < gmailMessageId.length; i++) {
        //         docs.push({
        //             owner,
        //             gmailMessageId: gmailMessageId[i],
        //             senderEmail: senderEmail[i],
        //             matchedTagInput: Array.isArray(matchedTagInput) ? matchedTagInput.map(id => new String(id)) : [],
        //             receivedAt: new Date(),
        //             processAt: new Date()
        //         });
        //     }
        // } else {
        //     docs.push({
        //         owner,
        //         gmailMessageId: Array.isArray(gmailMessageId) ? gmailMessageId[0] : gmailMessageId,
        //         senderEmail: Array.isArray(senderEmail) ? senderEmail[0] : senderEmail,
        //         matchedTagInput: Array.isArray(matchedTagInput) ? matchedTagInput.map(id => new String(id)) : [],
        //         receivedAt: new Date(),
        //         processAt: new Date()
        //     });
        // }
        
        const docs = Array.isArray(job.data?.documents) ? job.data.documents : [];
        if (!docs.length) return;

        await getdb().collection("emailmatches").insertMany(docs, {ordered: false});
    }, {
        connection: redisClient,
        concurrency: 5,
        lockDuration: 30000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });

    saveMailToDbWorker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully.`);
    });

    saveMailToDbWorker.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed with error:`, err);
    });
};

module.exports = { saveMailToDbWorkerHandler };