const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// List user's alerts
router.get('/', authenticateToken, (req, res) => {
  try {
    const alerts = query(`SELECT * FROM alerts WHERE user_id = '${req.user.id}' ORDER BY created_at DESC`);
    res.json(alerts);
  } catch (error) {
    console.error('List alerts error:', error);
    res.status(500).json({ error: 'Failed to list alerts' });
  }
});

module.exports = router;
