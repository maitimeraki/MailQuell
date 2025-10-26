const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { watchGmailHandler, stopWatchHandler, watchInfoFunction } = require("../middlewares/watchGmailHandler");
const { autoLogin } = require("../middlewares/autoLogin");
const { startWatch, stopWatch, getStatus } = require("../service/watchService");
const { profileIn } = require("../service/profileData");



router.post("/watch-gmail", async (req, res) => {
  const token = req.session.token;
  console.log(token);
  let tokens = null;
  try {
    tokens = typeof token === "string" ? JSON.parse(token) : token;
  } catch (e) {
    console.warn("Could not parse tokens from session in user.route :", e);
  }
  const access_token = tokens?.access_token;

  const { watching } = req.body || {};
  const profileInformation = await profileIn(access_token);

  console.log(profileInformation);
  const createdBy = profileInformation && profileInformation?.sub;
  
  try {
    if (!createdBy) {
      return res.status(400).json({ ok: false, error: "createdBy is required" });
    }

    if (watching) {
      await watchGmailHandler(req, res);
      const watchInfo = await watchInfoFunction();
      const { expiration, historyId } = watchInfo;
      // persist watch metadata idempotently
      await startWatch({ createdBy, expiration, historyId });
      if (!res.headersSent) return res.json({ ok: true, watching: true });
      return;
    }


=======
const { watchGmailHandler, stopWatchHandler } = require("../middlewares/watchGmailHandler");
const { autoLogin } = require("../middlewares/autoLogin");
const { startWatch, stopWatch, getStatus } = require("../service/watchService");
const {profileIn} = require("../service/profileData");

const profileInformation=profileIn();
router.post("/watch-gmail", async (req, res) => {
  const { watching, channelId, resourceId, expiration, historyId } = req.body || {};
  console.log(profileInformation);
  const createdBy = req.session?.token?.sub || profileInformation.sub;
  try {
    if(!createdBy) {
      return res.status(400).json({ ok: false, error: "createdBy is required" });
    }
    if (watching) {
      await watchGmailHandler(req, res);
         // persist watch metadata idempotently
      await startWatch({ createdBy, accountEmail: req.session?.email, channelId, resourceId, expiration, historyId });
      if (!res.headersSent) return res.json({ ok: true, watching: true });
      return;
    } else {
       // stop both Gmail resource and persistent flag
      await stopWatchHandler(req.session?.oauthState || createdBy).catch(() => {});
      await stopWatch({ createdBy });
      return res.json({ ok: true, watching: false });
    }

>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
  } catch (e) {
    console.error("Error in /watch-gmail:", e);
    if (!res.headersSent)
      res.status(500).json({ ok: false, error: "Watch toggle failed" });
  }
});

<<<<<<< HEAD

router.post('/stop-watch', async (req, res) => {
  const profileInformation = await profileIn();
  const createdBy = profileInformation?.sub;
  await stopWatchHandler(createdBy);
  await stopWatch({ createdBy });
  res.status(200).send('Stopped watching Gmail.');
});


// // New status endpoint for UI
router.get("/status", async (req, res) => {
  const profileInformation = await profileIn();
  const createdBy = profileInformation?.sub;
=======
// New status endpoint for UI
router.get("/integration/status", async (req, res) => {
  const createdBy = req.session?.profile?.sub || req.query.createdBy || req.session?.createdBy;
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
  if (!createdBy) return res.status(400).json({ ok: false, error: "createdBy required" });
  try {
    const status = await getStatus({ createdBy });
    res.json({ ok: true, status });
  } catch (e) {
<<<<<<< HEAD
    console.error("/status error", e);
=======
    console.error("integration/status error", e);
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
    res.status(500).json({ ok: false, error: "status fetch failed" });
  }
});


router.post('/log-out', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
  res.clearCookie('connect.sid');
  res.cookie("auth_token", "");
});


router.post("/auto-login", async (req, res, next) => {
  try {
    await autoLogin(req, res, next);
  } catch (e) {
    console.error("Error in /auto-login:", e);
    if (!res.headersSent)
      res.status(500).json({ ok: false, error: "Watch toggle failed" });
  }
});



module.exports = router;