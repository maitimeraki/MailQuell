const fs = require("fs").promises;

const path = require("path");
module.exports.profileData = async () => {
    try {
        const tokenPath = path.resolve(__dirname, '../token.json');
        const tokenData = await fs.readFile(tokenPath, "utf-8");
        const token = JSON.parse(tokenData);
        const access_token = token.access_token;
        console.log("Access Token:", access_token); // Debug log
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Access token is invalid or expired');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profileData = await response.json();
        console.log("Profile Data:", profileData); // Debug log
        return profileData;
    } catch (error) {
        console.error("Error fetching profile data:", error.message); // Debug log
        throw error; // Rethrow the error to be handled by the caller
    }
}