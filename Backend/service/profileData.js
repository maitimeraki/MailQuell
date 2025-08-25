const fs = require("fs").promises;

const path = require("path");
async function profileData(req, res) {
    try {
        // ../../ navigates two directories up, which takes you to MailSift.
        // const tokenPath = path.resolve(__dirname, '../../token.json');
        // const tokenData = await fs.readFile(tokenPath, "utf-8");
        const tokenData = req.cookies["auth_token"];
        if (!tokenData) {
            console.error("Token not found in cookies");
            return res.status(401).send("Unauthorized: No token found");
        }
        const access_token = JSON.parse(tokenData);
        // const access_token = token.access_token;
        console.log("Access Token:", access_token);                  
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            methods: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
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
        const profileData = await response.json();
        console.log("Profile Data:", profileData);
        return profileData;
    } catch (error) {
        console.error("Error fetching profile data:", error.message); // Debug log
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = { profileData };