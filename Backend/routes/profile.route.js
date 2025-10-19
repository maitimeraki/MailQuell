const express = require("express");
const router = express.Router();
const { profileData: fetchProfileData } = require("../service/profileData");
const { getdb } = require("../db/db");
router.get('/details/profile', async (req, res) => {
    try {
        //Not to create naming conflicts with the imported function
        const profile = await fetchProfileData(req, res);
        if (!profile) {
            return res.status(404).json({ error: "Profile data not found" });
        }
        console.log("Profile data:", profile); // Debug log
        const { sub, name, email, picture } = profile;
        if (!sub || !name || !email) return res.status(400).json({ error: "sub,name,email required" });

        const user = {
            workspaceId: sub,
            name,
            email: email.toLowerCase(),
            avatarUrl: picture || null,
            roles: "member",
            disabled: false,
        };
        const existingUser = await getdb().collection("users").findOne({ workspaceId: sub });
        if (existingUser) {
            // Update existing user details
            await getdb().collection("users").updateOne(
                { workspaceId: sub },
                { $set: {workspaceId: sub, name: name, email: email.toLowerCase(), avatarUrl: picture || null } }
            );
            return res.json(profile);
        }
        await getdb().collection("users").insertOne(user);
        res.json(profile);
    } catch (error) {
        console.error("Error fetching to profile data:", error.message);
        res.status(404).json({ error: error.message });
    }
});

router.get("/terms.html", async (req, res) => {
    return res.json({
        success: true,
        message: "Terms and conditions accepted"
    })
})
router.get("/privacy.html", async (req, res) => {
    return res.json({
        success: true,
        message: "Terms and conditions accepted"
    })
})
module.exports = router;