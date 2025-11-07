let profileInformation = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function profileData(req, res) {

    try {

        console.log("🆔 WATCH-GMAIL Session ID:", req.sessionID);
        let tokenData = req.cookies["auth_token"];
        console.log("Token data from cookies :", tokenData);
        if (!tokenData) {
            console.error("Token not found in cookies");
            return res.status(401).send("Unauthorized: No token found");
        };

        if (profileInformation.has(tokenData)) {
            console.log("✅ Returning cached profile data");
            const cachedData = profileInformation.get(tokenData);
            return res.json(cachedData); // Or return cachedData if not using express res
        }
        console.log(typeof tokenData);
        tokenData = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);
        // tokenData = JSON.parse(tokenData);
        // const access_token = token.access_token;   
        console.log("Access Token:", tokenData);
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json'
            }
            ,
            scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
        });


        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Access token is invalid or expired');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        // Store in cache with timestamp
        profileInformation.set(req.sessionID, {
            data: responseData,
            timestamp: Date.now()
        });
        setTimeout(() => {
            profileInformation.delete(req.sessionID);
            console.log('Removed cashed profile data for token!!')
        }, CACHE_TTL);

        console.log("Profile Data:", responseData);

        return responseData;

    } catch (error) {
        console.error("Error fetching profile data:", error.message); // Debug log
        throw error; // Rethrow the error to be handled by the caller
    }
}

const profileIn = (user_sessionID) => {
    console.log(typeof user_sessionID);
    console.log("Looking up profile for token:", user_sessionID);

    const cached = profileInformation.get(user_sessionID);
    if (cached) {
        console.log("✅ Found cached profile data");
        console.log('Cached profile data:', cached.data);
        return cached.data;
    }

    console.log("❌ No cached profile data found");
    return null;
}
module.exports = { profileData, profileIn };