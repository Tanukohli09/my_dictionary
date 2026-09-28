const assert = require('node:assert/strict');

const baseUrl = (process.env.BETA_BASE_URL || '').trim().replace(/\/$/, '');
const apiBaseUrl = (process.env.BETA_API_BASE_URL || baseUrl).trim().replace(/\/$/, '');
const webOrigin = (
  process.env.BETA_WEB_ORIGIN || (baseUrl ? new URL(baseUrl).origin : '')
).trim().replace(/\/$/, '');
const words = (process.env.BETA_WORDS || 'owl,apply,sesquipedalian')
  .split(',')
  .map((word) => word.trim().toLowerCase())
  .filter(Boolean);
const notFoundWord = (process.env.BETA_NOT_FOUND_WORD || 'zzzzzzzzzz').trim().toLowerCase();
const expectedProvider = process.env.BETA_EXPECTED_PROVIDER?.trim() || null;
const timeoutMs = Number(process.env.BETA_REQUEST_TIMEOUT_MS || 30_000);
const requireProviderApproval = process.env.BETA_REQUIRE_PROVIDER_APPROVED !== 'false';

if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
  throw new Error('Set BETA_BASE_URL to the deployed HTTP(S) service before running beta:smoke.');
}
if (!apiBaseUrl || !webOrigin) {
  throw new Error('BETA_API_BASE_URL and BETA_WEB_ORIGIN must resolve to valid URLs.');
}
if (!words.length) throw new Error('BETA_WORDS must contain at least one lookup word.');

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const { headers: optionHeaders, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        Accept: 'application/json, text/html',
        Origin: webOrigin,
        ...optionHeaders,
      },
      signal: controller.signal,
    });
    const body = await response.text();
    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      // HTML/static responses are intentionally kept as text.
    }
    return { body, parsed, response };
  } finally {
    clearTimeout(timer);
  }
}

function assertCors(response, label) {
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    webOrigin,
    label + ' should allow only the configured web origin',
  );
}

function assertWebSecurityHeaders(response) {
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(
    response.headers.get('content-security-policy') || '',
    /default-src 'self'/,
    'web root should include a restrictive CSP',
  );
}

async function run() {
  const health = await request(baseUrl + '/health');
  assert.equal(health.response.status, 200, '/health returned ' + health.response.status);
  assert.equal(health.parsed?.ok, true, '/health should report ok=true');
  if (requireProviderApproval) {
    assert.equal(
      health.parsed?.providerApproved,
      true,
      '/health should report approved provider configuration',
    );
  }
  if (expectedProvider) {
    assert.equal(
      health.parsed?.provider,
      expectedProvider,
      'health provider should match the expected provider',
    );
  }

  const ready = await request(baseUrl + '/ready');
  assert.equal(ready.response.status, 200, '/ready returned ' + ready.response.status);
  assert.equal(ready.parsed?.ok, true, '/ready should report ok=true');
  assert.equal(
    ready.parsed?.providerCheck?.ok,
    true,
    '/ready should report a successful provider check',
  );
  assertCors(ready.response, 'readiness response');

  const web = await request(baseUrl + '/');
  assert.equal(web.response.status, 200, 'web root returned ' + web.response.status);
  assert.match(
    web.response.headers.get('content-type') || '',
    /text\/html/i,
    'web root should return HTML',
  );
  assert.match(web.body, /<html/i, 'web root should contain an HTML document');
  assertWebSecurityHeaders(web.response);
  assertCors(web.response, 'web root');

  const preflight = await request(
    apiBaseUrl + '/api/dictionary/' + encodeURIComponent(words[0]),
    {
      method: 'OPTIONS',
      headers: { 'Access-Control-Request-Method': 'GET' },
    },
  );
  assert.equal(
    preflight.response.status,
    204,
    'API preflight returned ' + preflight.response.status,
  );
  assertCors(preflight.response, 'API preflight');
  assert.match(
    preflight.response.headers.get('access-control-allow-methods') || '',
    /GET/,
    'API preflight should allow GET',
  );

  for (const word of words) {
    const lookup = await request(
      apiBaseUrl + '/api/dictionary/' + encodeURIComponent(word),
    );
    assert.equal(
      lookup.response.status,
      200,
      word + ' lookup returned ' + lookup.response.status,
    );
    assert.ok(
      Array.isArray(lookup.parsed) && lookup.parsed[0]?.meanings?.length,
      word + ' lookup should contain meanings',
    );
    assert.equal(
      String(lookup.parsed[0].word || '').toLowerCase(),
      word,
      word + ' lookup should return the requested word',
    );
    assert.ok(
      lookup.response.headers.get('x-request-id'),
      word + ' response should include a request ID',
    );
    assert.ok(
      lookup.response.headers.get('x-dictionary-provider'),
      word + ' response should identify its provider',
    );
    if (expectedProvider) {
      assert.equal(
        lookup.response.headers.get('x-dictionary-provider'),
        expectedProvider,
        word + ' lookup should use the expected provider',
      );
    }
    assertCors(lookup.response, word + ' lookup');
  }

  const missing = await request(
    apiBaseUrl + '/api/dictionary/' + encodeURIComponent(notFoundWord),
  );
  assert.equal(
    missing.response.status,
    404,
    'not-found lookup returned ' + missing.response.status,
  );
  assert.match(
    String(missing.parsed?.message || missing.body),
    /not found/i,
    'not-found response should be explicit',
  );
  assertCors(missing.response, 'not-found lookup');

  if (process.env.BETA_METRICS_TOKEN) {
    const metrics = await request(baseUrl + '/metrics', {
      headers: { 'X-Metrics-Token': process.env.BETA_METRICS_TOKEN },
    });
    assert.equal(metrics.response.status, 200, '/metrics returned ' + metrics.response.status);
    assert.equal(
      typeof metrics.parsed?.dictionaryRequests,
      'number',
      'metrics should expose dictionary request count',
    );
  } else {
    console.log(
      'Metrics check skipped: provide BETA_METRICS_TOKEN only in a protected operator environment.',
    );
  }

  console.log(
    'Beta smoke passed for ' + baseUrl + ': ' + words.join(', ') + ' plus ' + notFoundWord + ' not-found.',
  );
}

run().catch((error) => {
  console.error('Beta smoke failed: ' + error.message);
  process.exit(1);
});
