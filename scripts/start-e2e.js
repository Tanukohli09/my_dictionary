const http = require('node:http');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const portArgumentIndex = process.argv.indexOf('--port');
const port = Number(portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : process.env.PORT || 8082);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid E2E port: ${port}`);
  process.exit(1);
}

const distIndex = path.join(root, 'dist', 'index.html');
if (!require('node:fs').existsSync(distIndex)) {
  const expo = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'expo.cmd' : 'expo');
  const build = spawnSync(expo, ['export', '--platform', 'web'], { cwd: root, stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status || 1);
}

let retryAttempts = 0;

function providerResponse(provider, word) {
  if (word === 'fallbackword' && provider === 'primary') {
    return { status: 503, body: JSON.stringify({ message: 'Primary provider unavailable.' }) };
  }

  if (word === 'retryword' && provider === 'primary' && retryAttempts++ === 0) {
    return { status: 503, body: JSON.stringify({ message: 'Temporary provider failure.' }) };
  }

  if (word === 'retryword' && provider === 'fallback') {
    return { status: 503, body: JSON.stringify({ message: 'Fallback provider unavailable.' }) };
  }

  if (word === 'missingword') {
    return { status: 404, body: JSON.stringify({ message: 'Word not found.' }) };
  }

  if (word === 'timeoutword') {
    return { delay: 600, status: 200, body: JSON.stringify({}) };
  }

  if (provider === 'fallback') {
    return {
      status: 200,
      body: JSON.stringify({
        en: [{
          partOfSpeech: 'noun',
          definitions: [{ definition: `A fallback definition for ${word}.` }],
        }],
      }),
    };
  }

  return {
    status: 200,
    body: JSON.stringify([{
      word,
      phonetic: '/test/',
      phonetics: [],
      meanings: [{
        partOfSpeech: 'noun',
        definitions: [{ definition: `A test definition for ${word}.`, example: `Use ${word} in a sentence.` }],
      }],
    }]),
  };
}

function createMockProvider(provider) {
  return http.createServer((request, response) => {
    const word = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname.slice(1)).toLowerCase();
    const result = providerResponse(provider, word);
    const send = () => {
      response.statusCode = result.status;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(result.body);
    };
    if (result.delay) setTimeout(send, result.delay);
    else send();
  });
}

const primaryProvider = createMockProvider('primary');
const fallbackProvider = createMockProvider('fallback');
let api;
let shuttingDown = false;

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve(server.address().port);
    });
  });
}

async function start() {
  const [primaryPort, fallbackPort] = await Promise.all([listen(primaryProvider), listen(fallbackProvider)]);
  const apiEnv = {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
    NODE_ENV: 'test',
    DICTIONARY_ENV: 'test',
    DICTIONARY_PROVIDER: 'dictionaryapi',
    DICTIONARY_UPSTREAM_URL: `http://127.0.0.1:${primaryPort}`,
    DICTIONARY_FALLBACK_PROVIDER: 'wiktionary',
    DICTIONARY_FALLBACK_URL: `http://127.0.0.1:${fallbackPort}`,
    DICTIONARY_REQUEST_TIMEOUT_MS: '250',
    DICTIONARY_ALLOWED_ORIGIN: `http://127.0.0.1:${port}`,
    DICTIONARY_WEB_ROOT: path.join(root, 'dist'),
    DICTIONARY_HSTS: 'false',
    DICTIONARY_RATE_LIMIT_MAX: '100',
  };

  api = spawn(process.execPath, [path.join(root, 'server', 'dictionaryProxy.js')], {
    cwd: root,
    env: apiEnv,
    stdio: 'inherit',
  });

  api.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[e2e-api] stopped unexpectedly with code ${code}`);
      shutdown(code || 1);
    }
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (api && !api.killed) api.kill('SIGTERM');
  primaryProvider.close(() => undefined);
  fallbackProvider.close(() => undefined);
  setTimeout(() => process.exit(code), 250).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start().catch((error) => {
  console.error('[e2e-api] failed to start:', error);
  shutdown(1);
});
