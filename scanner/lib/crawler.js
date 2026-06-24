/**
 * Broken Link Detector
 * Crawls a website, follows internal links, and reports broken ones.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

/**
 * Normalize a URL by removing trailing slash and hash fragment for dedup.
 */
function normalizeUrl(href) {
  try {
    const parsed = new URL(href);
    parsed.hash = '';
    let normalized = parsed.href;
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Check if a URL is internal to the given base hostname.
 */
function isInternalLink(linkHref, baseHostname) {
  try {
    const parsed = new URL(linkHref, `https://${baseHostname}`);
    return parsed.hostname === baseHostname || parsed.hostname.endsWith('.' + baseHostname);
  } catch {
    return false;
  }
}

/**
 * Check a single URL for broken link status.
 */
async function checkLink(urlToCheck) {
  try {
    const response = await axios({
      method: 'head',
      url: urlToCheck,
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'DeadLink-Monitor/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      maxRedirects: 5
    });

    if (response.status >= 400) {
      return { url: urlToCheck, status: response.status, broken: true, error: `HTTP ${response.status}` };
    }
    return { url: urlToCheck, status: response.status, broken: false, error: null };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return { url: urlToCheck, status: null, broken: true, error: 'timeout' };
    }
    // If HEAD fails, try GET as fallback
    try {
      const response = await axios({
        method: 'get',
        url: urlToCheck,
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'DeadLink-Monitor/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        maxRedirects: 5,
        responseType: 'stream',
        // Only read first chunk to avoid downloading whole page
        transformResponse: [(data) => data]
      });
      response.data.destroy();
      if (response.status >= 400) {
        return { url: urlToCheck, status: response.status, broken: true, error: `HTTP ${response.status}` };
      }
      return { url: urlToCheck, status: response.status, broken: false, error: null };
    } catch (getErr) {
      return {
        url: urlToCheck,
        status: null,
        broken: true,
        error: getErr.code === 'ECONNREFUSED' ? 'connection_refused' :
               getErr.code === 'ENOTFOUND' ? 'dns_failure' :
               getErr.message || 'unknown_error'
      };
    }
  }
}

/**
 * Crawl a website starting from given URL, finding all internal links,
 * and checking each for broken status.
 *
 * @param {string} startUrl - The URL to start crawling from
 * @param {object} [options] - Optional settings
 * @param {number} [options.maxPages=50] - Maximum pages to crawl
 * @param {number} [options.concurrency=5] - Concurrent link checks
 * @returns {Promise<{checked: number, broken: Array, all: Array}>}
 */
async function findBrokenLinks(startUrl, options = {}) {
  const maxPages = options.maxPages || 50;
  const concurrency = options.concurrency || 5;

  let baseHostname;
  try {
    baseHostname = new URL(startUrl).hostname;
  } catch {
    return { checked: 0, broken: [], all: [], error: 'invalid_start_url' };
  }

  const visited = new Set();
  const toVisit = [startUrl];
  const allLinks = [];      // All links found on the site
  const linkStatuses = [];  // Checked link results
  let pagesCrawled = 0;

  // Phase 1: Crawl pages to discover links
  while (toVisit.length > 0 && pagesCrawled < maxPages) {
    const pageUrl = toVisit.shift();
    const normalized = normalizeUrl(pageUrl);
    if (!normalized || visited.has(normalized)) continue;
    visited.add(normalized);

    try {
      const response = await axios.get(pageUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'DeadLink-Monitor/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        maxRedirects: 5,
        responseType: 'text',
        // Only first 500KB
        transformResponse: [(data) => typeof data === 'string' ? data.slice(0, 500000) : data]
      });

      if (response.status >= 400) continue;
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) continue;

      const $ = cheerio.load(response.data);
      pagesCrawled++;

      // Find all <a href="..."> links
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') ||
            href.startsWith('mailto:') || href.startsWith('tel:')) return;

        let absoluteHref;
        try {
          absoluteHref = new URL(href, pageUrl).href;
        } catch {
          return;
        }

        // Only track links with http/https scheme
        if (!absoluteHref.startsWith('http://') && !absoluteHref.startsWith('https://')) return;

        // Normalize
        const normalizedHref = normalizeUrl(absoluteHref);
        if (!normalizedHref) return;

        // De-duplicate across all links
        if (!allLinks.some(l => l.url === normalizedHref)) {
          const internal = isInternalLink(absoluteHref, baseHostname);
          allLinks.push({ url: normalizedHref, internal, source: pageUrl });

          if (internal && !visited.has(normalizedHref) && !toVisit.some(u => normalizeUrl(u) === normalizedHref)) {
            toVisit.push(absoluteHref);
          }
        }
      });
    } catch (err) {
      // Skip pages that fail to load during crawling
      continue;
    }
  }

  // Phase 2: Check all discovered links for broken status
  const internalLinks = allLinks.filter(l => l.internal);
  const externalLinks = allLinks.filter(l => !l.internal);

  // Check internal links first (priority), then external (limited)
  const linksToCheck = [
    ...internalLinks.map(l => l.url),
    ...externalLinks.slice(0, 30).map(l => l.url) // Limit external link checks
  ];

  // Process with concurrency limit
  for (let i = 0; i < linksToCheck.length; i += concurrency) {
    const batch = linksToCheck.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(link => checkLink(link)));
    linkStatuses.push(...results);
  }

  const broken = linkStatuses.filter(r => r.broken);

  return {
    checked: linkStatuses.length,
    broken,
    all: linkStatuses,
    pagesCrawled
  };
}

module.exports = { findBrokenLinks, checkLink };