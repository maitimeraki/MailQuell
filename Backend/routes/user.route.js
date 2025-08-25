const express = require('express');
const router = express.Router();

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

module.exports = router;