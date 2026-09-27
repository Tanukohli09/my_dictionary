const assert = require('assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

function request(port, pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      method: options.method || 'GET',
      path: pathname,
      port,
      headers: options.headers,
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        body: Buffer.concat(chunks).toString('utf8'),
        headers: response.headers,
        statusCode: response.statusCode,
      }));
    });
    request.on('error', reject);
    request.end();
  });
}

async function waitForServer(port) {
  const end = Date.now() + 5_000;
  while (Date.now() < end) {
    try {
      const response = await request(port, '/health');
      if (response.statusCode === 200) return;
    } catch {
      // The child is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Dictionary server did not become ready.');
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Dictionary server did not shut down.')), 5_000);
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
}

(async () => {
  const rejectedProductionConfig = spawnSync(process.execPath, ['-e', "require('./server/dictionaryProxy.js')"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DICTIONARY_ALLOWED_ORIGIN: '*',
      DICTIONARY_ENV: 'production',
      DICTIONARY_PROVIDER_APPROVED: 'false',
      NODE_ENV: 'production',
    },
    encoding: 'utf8',
  });
  assert.notEqual(rejectedProductionConfig.status, 0, 'production must reject wildcard/unapproved configuration');

  const upstream = http.createServer((request, response) => {
    const word = decodeURIComponent(request.url.slice(1));
    const body = JSON.stringify([{
      meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: `A test definition for ${word}.` }] }],
      phonetic: '/test/',
      phonetics: [],
      word,
    }]);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(body);
  });
  const upstreamPort = await listen(upstream);
  const temporaryPortServer = http.createServer();
  const apiPort = await listen(temporaryPortServer);
  await close(temporaryPortServer);

  // The temporary port listener is closed immediately so the child can bind it.
  const env = {
    ...process.env,
    DICTIONARY_ALLOWED_ORIGIN: 'http://localhost:8080',
    DICTIONARY_ENABLE_WIKTIONARY_FALLBACK: 'false',
    DICTIONARY_ENV: 'production',
    DICTIONARY_HSTS: 'false',
    DICTIONARY_METRICS_TOKEN: 'phase2-test-token',
    DICTIONARY_PROVIDER_APPROVED: 'true',
    DICTIONARY_PROVIDER: 'dictionaryapi',
    DICTIONARY_UPSTREAM_URL: `http://127.0.0.1:${upstreamPort}`,
    DICTIONARY_WEB_ROOT: path.join(process.cwd(), 'dist'),
    HOST: '127.0.0.1',
    NODE_ENV: 'production',
    PORT: String(apiPort),
  };
  const child = spawn(process.execPath, [path.join(process.cwd(), 'server/dictionaryProxy.js')], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });

  try {
    await waitForServer(apiPort);

    const health = await request(apiPort, '/health');
    assert.equal(health.statusCode, 200);
    assert.equal(health.headers['x-content-type-options'], 'nosniff');
    assert.equal(health.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.ok(health.headers['x-request-id']);

    const ready = await request(apiPort, '/ready');
    assert.equal(ready.statusCode, 200);
    assert.equal(JSON.parse(ready.body).providerCheck.ok, true);

    const page = await request(apiPort, '/', { headers: { Origin: 'http://localhost:8080' } });
    assert.equal(page.statusCode, 200);
    assert.match(page.headers['content-security-policy'], /default-src 'self'/);

    const allowedLookup = await request(apiPort, '/api/dictionary/owl', { headers: { Origin: 'http://localhost:8080' } });
    assert.equal(allowedLookup.statusCode, 200);
    assert.equal(allowedLookup.headers['access-control-allow-origin'], 'http://localhost:8080');
    assert.equal(allowedLookup.headers['x-dictionary-provider'], 'dictionaryapi');
    assert.equal(JSON.parse(allowedLookup.body)[0].word, 'owl');

    const deniedLookup = await request(apiPort, '/api/dictionary/owl', { headers: { Origin: 'https://not-allowed.example' } });
    assert.equal(deniedLookup.statusCode, 403);

    const preflight = await request(apiPort, '/api/dictionary/owl', { method: 'OPTIONS', headers: { Origin: 'http://localhost:8080' } });
    assert.equal(preflight.statusCode, 204);

    const metrics = await request(apiPort, '/metrics', { headers: { 'X-Metrics-Token': 'phase2-test-token' } });
    assert.equal(metrics.statusCode, 200);
    assert.ok(JSON.parse(metrics.body).dictionaryRequests >= 1);

    child.kill('SIGTERM');
    const exit = await waitForExit(child);
    assert.equal(exit.code, 0, output);
    console.log('server hardening tests passed');
  } finally {
    if (!child.killed) child.kill('SIGTERM');
    await close(upstream);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
