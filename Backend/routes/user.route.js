const express = require('express');
const router = express.Router();
const { watchGmailHandler, stopWatchHandler, watchInfoFunction } = require("../middlewares/watchGmailHandler");
const { autoLogin } = require("../middlewares/autoLogin");
const { startWatch, stopWatch, getStatus } = require("../service/watchService");
const { profileIn } = require("../service/profileData");


router.post("/watch-gmail", async (req, res) => {

  try {
    console.log("🆔 WATCH-GMAIL Session ID:", req.sessionID);
    console.log(req.session)
    console.log("Session token:", req.session.token)
     // Ensure we have a valid session first
    if (!req.session.token) {
      return res.status(401).json({ ok: false, error: "Please login first" });
    }
    const token = await req.session.token;
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
  } catch (e) {
    console.error("Error in /watch-gmail:", e);
    if (!res.headersSent)
      res.status(500).json({ ok: false, error: "Watch toggle failed" });
  }
});


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
  if (!createdBy) return res.status(400).json({ ok: false, error: "createdBy required" });
  try {
    const status = await getStatus({ createdBy });
    res.json({ ok: true, status });
  } catch (e) {
    console.error("/status error", e);
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