const express = require("express");
const router = express.Router();
const { profileData: fetchProfileData } = require("../service/profileData");
router.get('/details/profile', async (req, res) => {
    try {
        //Not to create naming conflicts with the imported function
        const profile = await fetchProfileData();
        if (!profile) {
            return res.status(404).json({ error: "Profile data not found" });
        }
        console.log("Profile data:", profile); // Debug log
        res.json(profile);
    } catch (error) {
        console.error("Error fetching to profile data:", error.message);
        res.status(404).json({ error: error.message });
    }
}
)
module.exports = router;