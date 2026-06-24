/**
 * SSL Certificate Checker
 * Validates SSL certificate and checks expiry date using Node.js built-in TLS.
 */

const tls = require('tls');

/**
 * Check SSL certificate for a given hostname.
 * @param {string} url - Full URL (e.g. 'https://example.com')
 * @returns {Promise<{valid: boolean, issuer: string|null, expiresAt: string|null, daysRemaining: number|null, error: string|null}>}
 */
async function checkSSL(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const port = parsed.port || 443;

    return new Promise((resolve) => {
      const socket = tls.connect({
        host: hostname,
        port: parseInt(port, 10),
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 10000
      });

      socket.on('connect', () => {
        // Socket connected but not necessarily TLS handshake complete
      });

      socket.on('secureConnect', () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            issuer: null,
            expiresAt: null,
            daysRemaining: null,
            error: 'no_certificate'
          });
          return;
        }

        const expiresAt = new Date(cert.valid_to);
        const now = new Date();
        const daysRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));

        // Check if cert is expired or about to expire (within 30 days = warning)
        const valid = daysRemaining > 0;

        resolve({
          valid,
          issuer: cert.issuer ? cert.issuer.O || cert.issuer.CN || null : null,
          subject: cert.subject ? cert.subject.CN || null : null,
          expiresAt: expiresAt.toISOString(),
          daysRemaining,
          error: null
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({
          valid: false,
          issuer: null,
          expiresAt: null,
          daysRemaining: null,
          error: err.message || 'tls_error'
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          valid: false,
          issuer: null,
          expiresAt: null,
          daysRemaining: null,
          error: 'timeout'
        });
      });
    });
  } catch (err) {
    return {
      valid: false,
      issuer: null,
      expiresAt: null,
      daysRemaining: null,
      error: err.message || 'parse_error'
    };
  }
}

module.exports = { checkSSL };