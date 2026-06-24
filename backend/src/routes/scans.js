const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { runScan } = require('../utils/scheduler');

// List scans for a site
router.get('/:siteId', authenticateToken, (req, res) => {
  try {
    const { siteId } = req.params;

    // Verify ownership of the site
    const sites = query(`SELECT * FROM sites WHERE id = '${siteId}' AND user_id = '${req.user.id}'`);
    if (!sites || sites.length === 0) {
      return res.status(404).json({ error: 'Site not found or access denied' });
    }

    const scans = query(`SELECT * FROM scans WHERE site_id = '${siteId}' ORDER BY created_at DESC`);
    res.json(scans);
  } catch (error) {
    console.error('List scans error:', error);
    res.status(500).json({ error: 'Failed to list scans' });
  }
});

// Run a scan manually
router.post('/:siteId/run', authenticateToken, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Verify ownership of the site
    const sites = query(`SELECT * FROM sites WHERE id = '${siteId}' AND user_id = '${req.user.id}'`);
    if (!sites || sites.length === 0) {
      return res.status(404).json({ error: 'Site not found or access denied' });
    }

    // Trigger scan asynchronously
    runScan(siteId);

    res.json({ message: 'Scan started successfully' });
  } catch (error) {
    console.error('Run scan error:', error);
    res.status(500).json({ error: 'Failed to trigger scan' });
  }
});

module.exports = router;
