const {Queue} = require('bullmq');
const { redisClient } = require('../config/redis');

// Create a Queue
const gmailQueue = new Queue("gmail-notifications",{
    connection: redisClient
});

module.exports = {gmailQueue};