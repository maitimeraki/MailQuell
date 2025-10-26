const express = require("express");
const router = express.Router();
const { profileData: fetchProfileData } = require("../service/profileData");
const { getdb } = require("../db/db");

router.get('/details/profile', async (req, res) => {
    try {
        const tokenData = req.session?.token;
        console.log("Token Data :",tokenData)

        let tokens = null;
        try {
            tokens = tokenData ? JSON.parse(tokenData) : null;
        } catch (e) {
            console.warn("Could not parse tokens from session:", e);
        }
        console.log("Token exists:", tokens ? "Yes" : "No");

        const profile = await fetchProfileData(req, res);
        if (!profile) {
            return res.status(404).json({ error: "Profile data not found" });
        }

        const { sub, name, email, picture, timezone } = profile;
        if (!sub || !name || !email) return res.status(400).json({ error: "sub,name,email required" });

        // Use externalId to reliably map Google sub -> user doc.
        // workspaceId will be an ObjectId; if a user exists keep their workspaceId, else create one.
        const users = getdb().collection("users");
        const externalId = String(sub);

        // Try find existing user by workspaceId
        let existingUser = await users.findOne({ workspaceId: externalId });

        // Build common fields to set/update
        const now = new Date();
        const accessToken = tokens?.access_token || null;
        const refreshToken = tokens?.refresh_token || existingUser?.refreshToken || null;
        const accessTokenExpiresAt = tokens?.expiry_date ? new Date(tokens.expiry_date) : existingUser?.accessTokenExpiresAt || null;

        const userDoc = {
            name,
            email: email.toLowerCase(),
            avatarUrl: picture || null,
            timezone: timezone || existingUser?.timezone || null,
            refreshToken,
            accessToken,
            accessTokenExpiresAt,
            // ensure watch object exists; preserve existing watch info if present
            watch: existingUser?.watch || {
                enabled: false,
                historyId: null,
                expiration: null
            },
            lastSyncAt: existingUser?.lastSyncAt || null,
            syncStatus: existingUser?.syncStatus || "idle",
            roles: existingUser?.roles || "owner",
            disabled: existingUser?.disabled || false,
            updatedAt: now
        };

        if (existingUser) {
            // Update existing user, preserve workspaceId
            await users.updateOne(
                { workspaceId: externalId },
                {
                    $set: userDoc
                }
            );
            // reload
            existingUser = await users.findOne({ workspaceId: externalId });
            return res.json(profile);
        } else {
            // create new workspaceId (ObjectId) and insert
            // const workspaceId = new ObjectId();
            const newUser = {
                workspaceId: externalId,
                createdAt: now,
                ...userDoc
            };
            await users.insertOne(newUser);
            return res.json(profile);
        }

    } catch (error) {
        console.error("Error fetching to profile data:", error.message || error);
        res.status(500).json({ error: error.message || String(error) });
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