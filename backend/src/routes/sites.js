const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { runScan } = require('../utils/scheduler');

// List user's sites
router.get('/', authenticateToken, (req, res) => {
  try {
    const sites = query(`SELECT * FROM sites WHERE user_id = '${req.user.id}' ORDER BY created_at DESC`);
    res.json(sites);
  } catch (error) {
    console.error('List sites error:', error);
    res.status(500).json({ error: 'Failed to list sites' });
  }
});

const planLimits = {
  'free': 1,
  'starter': 5,
  'professional': 20,
  'agency': 999
};

// Add a site
router.post('/', authenticateToken, (req, res) => {
  try {
    const { url, name, scan_frequency } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check plan limits
    const users = query(`SELECT plan FROM app_users WHERE id = '${req.user.id}'`);
    const userPlan = users[0]?.plan || 'free';
    const limit = planLimits[userPlan] || 1;

    const existingSites = query(`SELECT COUNT(*) as count FROM sites WHERE user_id = '${req.user.id}'`);
    if (existingSites[0].count >= limit) {
      return res.status(403).json({ 
        error: `Plan limit reached. Your ${userPlan} plan allows up to ${limit} site(s). Please upgrade to add more.` 
      });
    }

    const id = uuidv4();
    const frequency = scan_frequency || 86400; // Default 24h

    query(`INSERT INTO sites (id, user_id, url, name, scan_frequency) VALUES ('${id}', '${req.user.id}', '${escape(url)}', '${escape(name || '')}', ${frequency})`);

    // Trigger initial scan
    runScan(id);

    res.status(201).json({ id, url, name, scan_frequency: frequency });
  } catch (error) {
    console.error('Add site error:', error);
    res.status(500).json({ error: 'Failed to add site' });
  }
});

// Delete a site
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const sites = query(`SELECT * FROM sites WHERE id = '${id}' AND user_id = '${req.user.id}'`);
    if (!sites || sites.length === 0) {
      return res.status(404).json({ error: 'Site not found or access denied' });
    }

    query(`DELETE FROM issues WHERE site_id = '${id}'`);
    query(`DELETE FROM alerts WHERE site_id = '${id}'`);
    query(`DELETE FROM scans WHERE site_id = '${id}'`);
    query(`DELETE FROM sites WHERE id = '${id}'`);
    
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

module.exports = router;
