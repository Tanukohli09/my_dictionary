const assert = require('node:assert/strict');

const baseUrl = (process.env.RELEASE_BASE_URL || 'http://127.0.0.1:8082').replace(/\/$/, '');
const apiBaseUrl = (process.env.RELEASE_API_BASE_URL || baseUrl).replace(/\/$/, '');
const webOrigin = process.env.RELEASE_WEB_ORIGIN || new URL(baseUrl).origin;
const smokeWord = (process.env.RELEASE_SMOKE_WORD || 'owl').trim().toLowerCase();
const requireReady = process.env.RELEASE_REQUIRE_READY !== 'false';
const expectedProvider = process.env.RELEASE_EXPECTED_PROVIDER?.trim() || null;

async function request(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/html',
      Origin: webOrigin,
      ...headers,
    },
  });
  const body = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    // HTML/static responses are intentionally kept as text.
  }
  return { body, parsed, response };
}

function assertHeader(response, name, expected) {
  assert.equal(response.headers.get(name), expected, `${name} should be ${expected}`);
}

async function run() {
  const health = await request(`${baseUrl}/health`);
  assert.equal(health.response.status, 200, `/health returned ${health.response.status}`);
  assert.equal(health.parsed?.ok, true, '/health should report ok=true');

  if (requireReady) {
    const ready = await request(`${baseUrl}/ready`);
    assert.equal(ready.response.status, 200, `/ready returned ${ready.response.status}`);
    assert.equal(ready.parsed?.ok, true, '/ready should report ok=true');
  }

  const web = await request(`${baseUrl}/`);
  assert.equal(web.response.status, 200, `web root returned ${web.response.status}`);
  assert.match(web.response.headers.get('content-type') || '', /text\/html/i, 'web root should return HTML');
  assert.match(web.body, /<html/i, 'web root should contain an HTML document');
  assertHeader(web.response, 'x-content-type-options', 'nosniff');
  assertHeader(web.response, 'referrer-policy', 'strict-origin-when-cross-origin');
  assertHeader(web.response, 'x-frame-options', 'DENY');
  assert.match(web.response.headers.get('content-security-policy') || '', /default-src 'self'/, 'web root should include CSP');

  const lookup = await request(`${apiBaseUrl}/api/dictionary/${encodeURIComponent(smokeWord)}`);
  assert.equal(lookup.response.status, 200, `dictionary lookup returned ${lookup.response.status}`);
  assert.ok(Array.isArray(lookup.parsed) && lookup.parsed[0]?.meanings?.length, 'dictionary lookup should contain meanings');
  assert.equal(lookup.response.headers.get('access-control-allow-origin'), webOrigin, 'API CORS should allow only the configured web origin');
  assert.ok(lookup.response.headers.get('x-request-id'), 'dictionary response should include a request ID');
  if (expectedProvider) assert.equal(lookup.response.headers.get('x-dictionary-provider'), expectedProvider, 'dictionary provider should match the expected staging provider');

  console.log(`Release smoke passed for ${baseUrl} using ${smokeWord}.`);
}

run().catch((error) => {
  console.error(`Release smoke failed: ${error.message}`);
  process.exit(1);
});
