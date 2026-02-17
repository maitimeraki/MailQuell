// const Redis = require("redis");
// const redisClient = Redis.createClient({
//     url: process.env.REDIS_URL || "redis://localhost:6379"
// });

// redisClient.on("error", err => console.log("Redis Client error :", err));

// redisClient.connect().then(() => console.log("Redis Client connected!")).catch(err => console.log("Redis connection error :", err));

/* 
Using ioredis for better compatibility with BullMQ
*/

const Redis = require("ioredis");

// Using Redis Cluster for better scalability and reliability
// const redisCluster = new Redis.Cluster([
//     {
//         host: process.env.REDIS_HOST_1 || "localhost",
//         port: process.env.REDIS_PORT_1 || 6379

//     },
//     // {
//     //     host: process.env.REDIS_HOST_2 || "localhost",
//     //     port: process.env.REDIS_PORT_2 || 6379
//     // }
// ]); 
// ioredis automatically connects on instantiation
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // BullMQ specific recommendations:
    maxRetriesPerRequest: null, // Essential for BullMQ compatibility
});

redisClient.on("error", (err) => {
    console.error("Redis Client error:", err);
});

redisClient.on("connect", () => {
    console.log("Redis Client connected!");
});


module.exports = { redisClient };