const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const sites = query(`SELECT id FROM sites WHERE user_id = '${req.user.id}'`);
    const siteIds = sites.map(s => `'${s.id}'`).join(',');

    let stats = {
      activeSitesCount: sites.length,
      totalScansCount: 0,
      totalIssuesCount: 0,
      healthScore: 100,
      recentScans: [],
      unresolvedIssues: []
    };

    if (sites.length > 0) {
      // Count unresolved issues
      const issues = query(`SELECT COUNT(*) as count FROM issues WHERE site_id IN (${siteIds}) AND is_resolved = 0`);
      stats.totalIssuesCount = issues[0].count;

      // Total scans count
      const scansCount = query(`SELECT COUNT(*) as count FROM scans WHERE site_id IN (${siteIds})`);
      stats.totalScansCount = scansCount[0].count;

      // Average health score of last scans
      const lastScans = query(`
        SELECT health_score 
        FROM scans 
        WHERE site_id IN (${siteIds}) 
        AND status = 'completed'
        GROUP BY site_id
        HAVING MAX(completed_at)
      `);
      
      if (lastScans.length > 0) {
        const sum = lastScans.reduce((acc, scan) => acc + (scan.health_score || 0), 0);
        stats.healthScore = Math.round(sum / lastScans.length);
      }
      
      // Get 5 most recent scans
      stats.recentScans = query(`
        SELECT s.*, st.url as site_url, st.name as site_name
        FROM scans s
        JOIN sites st ON s.site_id = st.id
        WHERE st.user_id = '${req.user.id}'
        ORDER BY s.created_at DESC
        LIMIT 5
      `);

      // Get unresolved issues list
      stats.unresolvedIssues = query(`
        SELECT i.*, s.name as site_name, s.url as site_url
        FROM issues i
        JOIN sites s ON i.site_id = s.id
        WHERE i.site_id IN (${siteIds}) AND i.is_resolved = 0
        ORDER BY i.created_at DESC
        LIMIT 10
      `);
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

module.exports = router;
