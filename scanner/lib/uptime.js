/**
 * Uptime Checker
 * Verifies a website responds with HTTP 200 OK.
 */

const axios = require('axios');

/**
 * Check if a website is up and responding.
 * @param {string} url - The full URL to check (e.g. 'https://example.com')
 * @returns {Promise<{ok: boolean, statusCode: number|null, responseTimeMs: number|null, error: string|null}>}
 */
async function checkUptime(url) {
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      validateStatus: () => true, // Accept any status code
      headers: {
        'User-Agent': 'DeadLink-Monitor/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      maxRedirects: 5
    });
    const responseTimeMs = Date.now() - start;
    return {
      ok: response.status >= 200 && response.status < 400,
      statusCode: response.status,
      responseTimeMs,
      error: null
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    if (err.code === 'ECONNABORTED') {
      return { ok: false, statusCode: null, responseTimeMs, error: 'timeout' };
    }
    if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      return { ok: false, statusCode: null, responseTimeMs, error: 'dns_failure' };
    }
    if (err.code === 'ECONNREFUSED') {
      return { ok: false, statusCode: null, responseTimeMs, error: 'connection_refused' };
    }
    return { ok: false, statusCode: null, responseTimeMs, error: err.message || 'unknown_error' };
  }
}

module.exports = { checkUptime };