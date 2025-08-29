const express = require('express');
const router = express.Router();
const { watchGmailHandler, stopWatchHandler } = require("../middlewares/watchGmailHandler");

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
router.post("/watch-gmail", async (req, res) => {
  const { watching } = req.body || {};
  try {
    if (watching) {
      await watchGmailHandler(req, res);
      if (!res.headersSent) res.json({ ok: true, watching: true });
    } else {
      await stopWatchHandler(req.session.oauthState || 'default');
    }

  } catch (e) {
    console.error("Error in /watch-gmail:", e);
    if (!res.headersSent)
      res.status(500).json({ ok: false, error: "Watch toggle failed" });
  }
})
module.exports = router;