const express = require("express");
const router = express.Router();
const { profileData: fetchProfileData } = require("../service/profileData");
const { getdb } = require("../db/db");


router.get('/details/profile', async (req, res) => {

    console.log(req.session);
    const profile = await fetchProfileData(req, res);
    try {
        let tokens = null;
        
        if (req.session.token) {
            try {
                tokens = typeof req.session.token === "string" ? JSON.parse(req.session.token) : req.session.token;
            } catch (e) {
                tokens = null;
            }
        }
        console.log(tokens);
        //Not to create naming conflicts with the imported function
        if (!profile) {
            return res.status(404).json({ error: "Profile data not found!" });
        }

        const { sub, name, email, picture, timezone } = profile;
        if (!sub || !name || !email) return res.status(400).json({ error: "sub,name,email required" });
        // Implement workspaceId creation logic
        // Use externalId to reliably map Google sub -> user doc.
        // workspaceId will be an ObjectId; if a user exists keep their workspaceId, else create one.
        const users = await getdb().collection("users");
        const externalId = String(sub);

        // Try find existing user by workspaceId
        let existingUser = await users.findOne({ workspaceId: externalId });

        // Build common fields to set/update
        const now = new Date();
        const accessToken = tokens?.access_token || null;
        const refreshToken = tokens?.refresh_token || existingUser?.tokens?.refreshToken || null;
        const accessTokenExpiresAt = tokens?.expiry_date ? new Date(tokens.expiry_date) : existingUser?.tokens?.accessTokenExpiresAt || null;


        const userDoc = {
            name,
            email: email.toLowerCase(),
            avatarUrl: picture || null,
            timezone: timezone || existingUser?.timezone || null,
            tokens: {
                refreshToken,
                accessToken,
                accessTokenExpiresAt,
                lastRefreshAt: now
            },
            watch: existingUser?.watch || {
                enabled: false,
                historyId: null,
                expiration: null,
                lastSetupAt: null,
                lastError: null,
                webhookStatus: "pending"
            },
            lastSyncAt: existingUser?.lastSyncAt || null,
            syncStatus: existingUser?.syncStatus || "idle",
            roles: existingUser?.roles || "owner",
            disabled: existingUser?.disabled || false,
            lastLoginAt: now,
            lastWebhookAt: existingUser?.lastWebhookAt || null,
            audit: {
                createdAt: existingUser?.audit?.createdAt || now,
                updatedAt: now
            }
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
        console.log("Profile data:", profile); // Debug log
        // const { sub, name, email, picture } = profile;
        // if (!sub || !name || !email) return res.status(400).json({ error: "sub,name,email required" });

        // const user = {
        //     workspaceId: sub,
        //     name,
        //     email: email.toLowerCase(),
        //     avatarUrl: picture || null,
        //     roles: "member",
        //     disabled: false,
        // };
        // const existingUser = await getdb().collection("users").findOne({ workspaceId: sub });
        // if (existingUser) {
        //     // Update existing user details
        //     await getdb().collection("users").updateOne(
        //         { workspaceId: sub },
        //         { $set: {workspaceId: sub, name: name, email: email.toLowerCase(), avatarUrl: picture || null } }
        //     );
        //     return res.json(profile);
        // }
        // await getdb().collection("users").insertOne(user);
        // res.json(profile);
    }
}
);

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