const oAuth2Client = require("../controllers/oAuthClient");

module.exports.autoLogin = async (req, res, next) => {
    // Perform your autologin logic here
    if (!req.session.token) {
        window.location.href = `${process.env.FRONTEND_URL}`;
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {

        oAuth2Client.setCredentials({ refresh_token: req.session.token.refresh_token });
        const { credentials } = await oAuth2Client.getAccessToken();
        res.cookie("auth_token", credentials.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000 // 1 hour
        });
    } catch (error) {
        console.error("Error during auto login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        next();
    }
} 