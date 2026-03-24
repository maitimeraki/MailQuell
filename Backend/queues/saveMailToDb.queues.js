const { Queue } = require('bullmq');
const { redisClient } = require('../config/redis');
// Create a Queue
const saveMailToDbQueue = new Queue("save-mail-to-db", {
    connection: redisClient
});

async function addToSaveMailQueue(mailData) {
    await saveMailToDbQueue.add("saving-to-db", mailData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });
};


module.exports = { addToSaveMailQueue };