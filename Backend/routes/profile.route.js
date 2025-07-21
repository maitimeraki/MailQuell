const express = require("express");
const router = express.Router();
const { profileData: fetchProfileData } = require("../service/profileData");
router.get('/details/profile', async (req, res) => {
    try {
        //Not to create naming conflicts with the imported function
        const profile = await fetchProfileData(req,res);
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
router.get("/terms.html",async (req,res)=>{
    return res.json({
        success: true,
        message: "Terms and conditions accepted"
    })                             
})
router.get("/privacy.html",async (req,res)=>{
    return res.json({
        success: true,
        message: "Terms and conditions accepted"
    })                             
})
module.exports = router;