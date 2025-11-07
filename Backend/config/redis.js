const Redis = require("redis");


const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});


redisClient.on("error", err => console.log("Redis Client error :", err));

redisClient.connect().then(() => console.log("Redis Client connected!")).catch(err => console.log("Redis connection error :", err));


module.exports = { redisClient };