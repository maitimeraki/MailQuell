const oAuth2Client = require("../controllers/oAuthClient");

module.exports.autoLogin = async (req, res, next) => {
    try {
        // 1. Read stored session token
        let token = req.session.token;
        console.log("AutoLogin token from session:", token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (typeof token === "string") {
            token = JSON.parse(token);
        }
        // 2. If we already have a non‑expired access token, just set cookie
        const now = Date.now();
        if (token.access_token && token.expiry_date && token.expiry_date > now + 60000) {
            res.cookie("auth_token", token.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000 // 1 hour
            });
          next();
        }
        // 4. Set creds & fetch new access token
        await oAuth2Client.setCredentials({ refresh_token: token.refresh_token });
        const  at = await oAuth2Client.getAccessToken();
        console.log("New access token obtained:", at);
        const access_token= typeof at === "string" ? at : at?.token;
        // const access_token = credentials.access_token;
        if (!access_token) {
            return res.status(401).json({ message: "Could not obtain access token!" });
        }
        // 5. (Optional) update session with new short-lived access token + new expiry guess (1h)
        token.access_token = access_token;
        token.expiry_date = Date.now() + 55 * 60 * 1000;
        req.session.token = JSON.stringify(token);
        req.session.save();
        res.cookie("auth_token", token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000 // 1 hour
        });
        next();
    } catch (e) {
        console.error("Error during auto login:", e);
        res.status(500).json({ message: "Internal Server Error" });
    }

} 