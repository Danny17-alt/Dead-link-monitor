/**
 * DeadLink Monitor - Website Scanner Engine
 *
 * Main entry point. Orchestrates all scan checks:
 * - Uptime verification
 * - SSL certificate validation
 * - Broken link detection (crawler)
 * - Form detection
 *
 * Usage:
 *   const scanner = require('./index');
 *   const result = await scanner.scanSite('https://example.com');
 */

const { checkUptime } = require('./lib/uptime');
const { checkSSL } = require('./lib/ssl');
const { findBrokenLinks } = require('./lib/crawler');
const { findForms } = require('./lib/forms');

/**
 * Default scan options.
 */
const DEFAULTS = {
  /** Max pages to crawl for broken links */
  maxCrawlPages: 30,
  /** Whether to check SSL (skipped for http:// URLs) */
  checkSSL: true,
  /** Whether to do full broken link crawl */
  checkBrokenLinks: true,
  /** Whether to detect forms */
  checkForms: true,
  /** Timeout for the overall scan in ms */
  scanTimeout: 60000
};

/**
 * Compute an overall health score (0-100) from individual check results.
 * @param {object} results
 * @returns {number} Health score 0-100
 */
function computeHealthScore(results) {
  let score = 100;

  // Uptime: -40 if down
  if (!results.uptime || !results.uptime.ok) {
    score -= 40;
  }

  // SSL: -20 if invalid/expired, -10 if expiring soon (within 30 days)
  if (results.ssl) {
    if (!results.ssl.valid) {
      score -= 20;
    } else if (results.ssl.daysRemaining !== null && results.ssl.daysRemaining < 30) {
      score -= 10;
    }
  }

  // Broken links: -5 per broken link, max -30
  if (results.brokenLinks && results.brokenLinks.length > 0) {
    const penalty = Math.min(results.brokenLinks.length * 5, 30);
    score -= penalty;
  }

  // No forms found is not a penalty (some sites are just information pages)
  // But score shouldn't go below 0
  return Math.max(0, score);
}

/**
 * Scan a single site and return comprehensive results.
 *
 * @param {string} siteUrl - The URL to scan (e.g. 'https://example.com')
 * @param {object} [options] - Optional scan settings
 * @param {number} [options.maxCrawlPages=30] - Max pages to crawl for broken links
 * @param {boolean} [options.checkSSL=true] - Whether to check SSL
 * @param {boolean} [options.checkBrokenLinks=true] - Whether to do full broken link crawl
 * @param {boolean} [options.checkForms=true] - Whether to detect forms
 * @param {number} [options.scanTimeout=60000] - Timeout for the overall scan
 * @returns {Promise<object>} Scan results
 */
async function scanSite(siteUrl, options = {}) {
  const opts = { ...DEFAULTS, ...options };

  // Validate URL
  let normalizedUrl = siteUrl;
  try {
    const parsed = new URL(siteUrl);
    if (!parsed.protocol.startsWith('http')) {
      normalizedUrl = 'https://' + siteUrl;
      new URL(normalizedUrl); // validate again
    }
  } catch {
    return {
      url: siteUrl,
      success: false,
      error: 'invalid_url',
      health_score: 0,
      scannedAt: new Date().toISOString()
    };
  }

  const parsed = new URL(normalizedUrl);
  const isHttps = parsed.protocol === 'https:';

  const results = {
    url: normalizedUrl,
    hostname: parsed.hostname,
    success: true,
    error: null,
    scannedAt: new Date().toISOString(),
    uptime: null,
    ssl: null,
    brokenLinks: null,
    forms: null,
    health_score: 0
  };

  // Use AbortController for overall timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.scanTimeout);

  try {
    // Run checks in parallel where possible
    const checks = [];

    // 1. Uptime check (always)
    const uptimePromise = checkUptime(normalizedUrl);
    checks.push(
      uptimePromise.then(result => { results.uptime = result; })
        .catch(err => { results.uptime = { ok: false, statusCode: null, responseTimeMs: null, error: err.message }; })
    );

    // 2. SSL check (only for https:// URLs)
    if (opts.checkSSL && isHttps) {
      const sslPromise = checkSSL(normalizedUrl);
      checks.push(
        sslPromise.then(result => { results.ssl = result; })
          .catch(err => { results.ssl = { valid: false, issuer: null, expiresAt: null, daysRemaining: null, error: err.message }; })
      );
    } else {
      results.ssl = isHttps ? null : { valid: null, issuer: null, expiresAt: null, daysRemaining: null, error: 'not_https' };
    }

    // 3. Broken link detection and form detection (after uptime confirmed)
    // We'll wait for uptime first before crawling
    await uptimePromise;

    if (opts.checkBrokenLinks) {
      const crawlPromise = findBrokenLinks(normalizedUrl, { maxPages: opts.maxCrawlPages });
      checks.push(
        crawlPromise.then(result => {
          results.brokenLinks = {
            checked: result.checked,
            broken: result.broken,
            pagesCrawled: result.pagesCrawled,
            error: result.error || null
          };
        }).catch(err => {
          results.brokenLinks = { checked: 0, broken: [], pagesCrawled: 0, error: err.message };
        })
      );
    }

    if (opts.checkForms) {
      const formsPromise = findForms(normalizedUrl);
      checks.push(
        formsPromise.then(result => {
          results.forms = {
            total: result.total,
            forms: result.forms,
            error: result.error || null
          };
        }).catch(err => {
          results.forms = { total: 0, forms: [], error: err.message };
        })
      );
    }

    await Promise.all(checks);

    // Compute health score
    results.health_score = computeHealthScore(results);

  } catch (err) {
    if (err.name === 'AbortError') {
      results.error = 'scan_timeout';
    } else {
      results.error = err.message || 'scan_failed';
    }
    results.success = false;
    results.health_score = 0;
  } finally {
    clearTimeout(timeoutId);
  }

  return results;
}

/**
 * Quick scan - just uptime and SSL (no crawling).
 * Useful for dashboard pings.
 */
async function quickScan(siteUrl) {
  return scanSite(siteUrl, {
    maxCrawlPages: 0,
    checkBrokenLinks: false,
    checkForms: false,
    scanTimeout: 20000
  });
}

module.exports = { scanSite, quickScan, checkUptime, checkSSL, findBrokenLinks, findForms };