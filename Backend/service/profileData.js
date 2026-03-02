const { redisClient } = require('../config/redis');
const CACHE_TTL = 30 * 60; // 30 minutes in seconds for Redis

async function profileData(req, res) {
    try {
        console.log("🆔 WATCH-GMAIL Session ID:", req.sessionID);
        let tokenData = req.cookies["auth_token"];
        console.log("Token data from cookies :", tokenData);
        if (!tokenData) {
            console.error("Token not found in cookies");
            return res.status(401).send("Unauthorized: No token found");
        }

        // Try to get profile from Redis
        const cached = await redisClient.get(`profile:${req.sessionID}`);
        if (cached) {
            console.log("✅ Returning cached profile data from Redis");
            const cachedData = JSON.parse(cached);
            // return res.json(cachedData);
            return cachedData;
        }

        tokenData = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);
        console.log("Access Token:", tokenData);
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json'
            },
            scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Access token is invalid or expired');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        // Store in Redis with TTL
        await redisClient.set(`profile:${req.sessionID}`, JSON.stringify(responseData), 'EX', CACHE_TTL);
        console.log("Profile Data:", responseData);
        return responseData;
    } catch (error) {
        console.error("Error fetching profile data:", error.message);
        throw error;
    }
};

const profileIn = async (user_sessionID) => {
    console.log(typeof user_sessionID);
    console.log("Looking up profile for session:", user_sessionID);
    const cached = await redisClient.get(`profile:${user_sessionID}`);
    if (cached) {
        console.log("✅ Found cached profile data in Redis");
        return JSON.parse(cached);
    }
    console.log("❌ No cached profile data found in Redis");
    return null;
}
module.exports = { profileData, profileIn };