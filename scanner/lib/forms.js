/**
 * Form Detector
 * Finds HTML forms on a page and reports basic information about them.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Find all HTML forms on a page.
 * @param {string} url - The URL to scan
 * @returns {Promise<{forms: Array, total: number, error: string|null}>}
 */
async function findForms(url) {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'DeadLink-Monitor/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      maxRedirects: 5,
      responseType: 'text',
      transformResponse: [(data) => typeof data === 'string' ? data.slice(0, 500000) : data]
    });

    if (response.status >= 400) {
      return { forms: [], total: 0, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return { forms: [], total: 0, error: 'not_html' };
    }

    const $ = cheerio.load(response.data);
    const forms = [];

    $('form').each((i, el) => {
      const $form = $(el);
      const action = $form.attr('action') || '';
      const method = ($form.attr('method') || 'get').toUpperCase();
      const name = $form.attr('name') || $form.attr('id') || `form_${i}`;

      // Find inputs, textareas, selects
      const inputs = [];
      $form.find('input, textarea, select').each((_, inputEl) => {
        const $input = $(inputEl);
        const tagName = inputEl.tagName.toLowerCase();
        inputs.push({
          type: tagName === 'textarea' ? 'textarea' :
                tagName === 'select' ? 'select' :
                $input.attr('type') || 'text',
          name: $input.attr('name') || '',
          required: $input.attr('required') !== undefined || $input.attr('aria-required') === 'true'
        });
      });

      const actionUrl = action ? (() => {
        try {
          return new URL(action, url).href;
        } catch {
          return action;
        }
      })() : url;

      forms.push({
        name,
        action: actionUrl,
        method,
        inputCount: inputs.length,
        inputs,
        hasSubmitButton: $form.find('button[type="submit"], input[type="submit"], input[type="image"]').length > 0
      });
    });

    return { forms, total: forms.length, error: null };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return { forms: [], total: 0, error: 'timeout' };
    }
    if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      return { forms: [], total: 0, error: 'dns_failure' };
    }
    return { forms: [], total: 0, error: err.message || 'unknown_error' };
  }
}

module.exports = { findForms };