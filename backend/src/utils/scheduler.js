const { v4: uuidv4 } = require('uuid');
const { query, escape } = require('./db');
const { scanSite } = require('/home/team/shared/scanner');

/**
 * Runs a scan for a site and saves results.
 * @param {string} siteId 
 */
async function runScan(siteId) {
  try {
    const sites = query(`SELECT * FROM sites WHERE id = '${siteId}'`);
    if (!sites || sites.length === 0) {
      console.error(`Site ${siteId} not found for scan`);
      return;
    }
    const site = sites[0];

    // Create a pending scan record
    const scanId = uuidv4();
    query(`INSERT INTO scans (id, site_id, status, started_at) VALUES ('${scanId}', '${siteId}', 'pending', datetime('now'))`);

    // Run the actual scan
    const results = await scanSite(site.url);

    if (results.success) {
      const brokenLinksCount = results.brokenLinks ? results.brokenLinks.broken.length : 0;
      const totalUrls = results.brokenLinks ? results.brokenLinks.checked : 0;
      const totalForms = results.forms ? results.forms.total : 0;
      const sslValid = results.ssl ? (results.ssl.valid ? 1 : 0) : 1;
      const uptimeOk = results.uptime ? (results.uptime.ok ? 1 : 0) : 0;

      // Update scan record
      query(`UPDATE scans SET 
        status = 'completed',
        total_urls = ${totalUrls},
        broken_links = ${brokenLinksCount},
        total_forms = ${totalForms},
        ssl_valid = ${sslValid},
        ssl_expiry_date = ${results.ssl && results.ssl.expiresAt ? `'${results.ssl.expiresAt}'` : 'NULL'},
        uptime_ok = ${uptimeOk},
        health_score = ${results.health_score},
        completed_at = datetime('now')
        WHERE id = '${scanId}'`);

      // Update site last_scan_at
      query(`UPDATE sites SET last_scan_at = datetime('now') WHERE id = '${siteId}'`);

      // Handle issues and alerts
      await processIssues(site, scanId, results);

    } else {
      // Scan failed
      query(`UPDATE scans SET 
        status = 'failed',
        completed_at = datetime('now')
        WHERE id = '${scanId}'`);
    }
  } catch (error) {
    console.error(`Error running scan for site ${siteId}:`, error);
  }
}

async function processIssues(site, scanId, results) {
  const issues = [];

  // Uptime issue
  if (results.uptime && !results.uptime.ok) {
    issues.push({
      type: 'uptime_issue',
      url: site.url,
      status_code: results.uptime.statusCode || 0,
      description: `Site is down. Error: ${results.uptime.error || 'Unknown'}`
    });
  }

  // SSL issue
  if (results.ssl && results.ssl.valid === false) {
    issues.push({
      type: 'ssl_issue',
      url: site.url,
      description: `SSL certificate is invalid or expired. Error: ${results.ssl.error || 'Unknown'}`
    });
  } else if (results.ssl && results.ssl.daysRemaining !== null && results.ssl.daysRemaining < 7) {
    issues.push({
      type: 'ssl_issue',
      url: site.url,
      description: `SSL certificate expires in ${results.ssl.daysRemaining} days.`
    });
  }

  // Broken links
  if (results.brokenLinks && results.brokenLinks.broken.length > 0) {
    results.brokenLinks.broken.forEach(link => {
      issues.push({
        type: 'broken_link',
        url: link.url,
        status_code: link.status || 0,
        description: `Broken link found on ${link.source}`
      });
    });
  }

  // Save issues and create alerts
  for (const issue of issues) {
    const issueId = uuidv4();
    query(`INSERT INTO issues (id, scan_id, site_id, type, url, status_code, description) 
      VALUES ('${issueId}', '${scanId}', '${site.id}', '${issue.type}', '${escape(issue.url)}', ${issue.status_code || 'NULL'}, '${escape(issue.description)}')`);

    // Create alert for each issue (maybe we should group them, but task says "Create alerts for new issues")
    const alertId = uuidv4();
    const title = `New ${issue.type.replace('_', ' ')} detected`;
    const message = `Issue: ${issue.description} at ${issue.url}`;
    
    query(`INSERT INTO alerts (id, user_id, site_id, type, title, message) 
      VALUES ('${alertId}', '${site.user_id}', '${site.id}', 'email', '${escape(title)}', '${escape(message)}')`);
  }
}

/**
 * Periodically checks for sites that need scanning.
 */
function startScheduler() {
  console.log('Starting scan scheduler...');
  
  // Check every minute
  setInterval(async () => {
    try {
      // Find sites where (now - last_scan_at) > scan_frequency
      // SQLite: strftime('%s','now') - strftime('%s', last_scan_at)
      const dueSites = query(`
        SELECT id FROM sites 
        WHERE is_active = 1 
        AND (
          last_scan_at IS NULL 
          OR (strftime('%s', 'now') - strftime('%s', last_scan_at)) >= scan_frequency
        )
      `);

      if (dueSites && dueSites.length > 0) {
        console.log(`Found ${dueSites.length} sites due for scan`);
        for (const site of dueSites) {
          // Trigger scan asynchronously
          runScan(site.id);
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, 60000); // 1 minute
}

module.exports = { runScan, startScheduler };
