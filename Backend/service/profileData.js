const fs = require("fs").promises;

const path = require("path");
let profileInformation = new Map();
async function profileData(req, res) {
    try {
        // ../../ navigates two directories up, which takes you to MailSift.
        // const tokenPath = path.resolve(__dirname, '../../token.json');
        // const tokenData = await fs.readFile(tokenPath, "utf-8");
        let tokenData = req.cookies["auth_token"];
        console.log("Token data from cookies :", tokenData);
        if (!tokenData) {
            console.error("Token not found in cookies");

            return res.status(401).send("Unauthorized: No token found");
        }
        console.log(typeof tokenData);

        tokenData = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);

        const access_token = JSON.parse(tokenData);
        // const access_token = token.access_token;
        console.log("Access Token:", access_token);
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            method: 'GET',
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
        const responseData = await response.json();
        profileInformation.set(tokenData, responseData);

        console.log("Profile Data:", responseData);
        return responseData;

    } catch (error) {
        console.error("Error fetching profile data:", error.message); // Debug log
        throw error; // Rethrow the error to be handled by the caller
    }
}

const profileIn = async (user_token) => {
    console.log(user_token);
    return await profileInformation.get(user_token);
}

module.exports = { profileData, profileIn };