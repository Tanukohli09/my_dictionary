const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || process.env.DICTIONARY_PROXY_PORT || 3001);
const HOST = process.env.HOST || process.env.DICTIONARY_PROXY_HOST || '127.0.0.1';
const configuredProvider = process.env.DICTIONARY_PROVIDER?.trim().toLowerCase();
const PROVIDER = configuredProvider || (process.env.DICTIONARY_UPSTREAM_URL ? 'dictionaryapi' : 'datamuse');
const UPSTREAM = (process.env.DICTIONARY_UPSTREAM_URL || defaultUpstream(PROVIDER)).replace(/\/$/, '');
const FALLBACK_PROVIDER = process.env.DICTIONARY_ENABLE_WIKTIONARY_FALLBACK === 'false'
  ? null
  : (process.env.DICTIONARY_FALLBACK_PROVIDER || 'wiktionary').trim().toLowerCase();
const FALLBACK_UPSTREAM = (process.env.DICTIONARY_FALLBACK_URL || defaultUpstream(FALLBACK_PROVIDER || 'wiktionary'))
  .replace(/\/$/, '');
const WEB_ROOT = path.resolve(
  process.env.DICTIONARY_WEB_ROOT || path.join(__dirname, '..', 'dist'),
);
const API_PATH_PREFIX = '/api/dictionary/';
const REQUEST_TIMEOUT_MS = Number(process.env.DICTIONARY_REQUEST_TIMEOUT_MS || 5000);
const CACHE_TTL_MS = Number(process.env.DICTIONARY_CACHE_TTL_MS || 60 * 60 * 1000);
const NOT_FOUND_CACHE_TTL_MS = Number(
  process.env.DICTIONARY_NOT_FOUND_CACHE_TTL_MS || 5 * 60 * 1000,
);
const CACHE_MAX_ENTRIES = Number(process.env.DICTIONARY_CACHE_MAX_ENTRIES || 5000);
const RATE_LIMIT_MAX = Number(process.env.DICTIONARY_RATE_LIMIT_MAX || 60);
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.DICTIONARY_RATE_LIMIT_WINDOW_MS || 60 * 1000,
);
const WIKTIONARY_MAX_CONCURRENT_REQUESTS = 3;
const WIKTIONARY_MAX_REQUESTS_PER_MINUTE = 180;
const WIKTIONARY_RATE_WINDOW_MS = 60 * 1000;
const WIKTIONARY_MAX_PENDING_REQUESTS = 60;
const TRUST_PROXY = process.env.DICTIONARY_TRUST_PROXY === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.DICTIONARY_ENV === 'production';
const PROVIDER_APPROVED = process.env.DICTIONARY_PROVIDER_APPROVED === 'true';
const configuredAllowedOrigins = process.env.DICTIONARY_ALLOWED_ORIGIN?.trim();
const ALLOWED_ORIGINS = (configuredAllowedOrigins || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const HSTS_ENABLED = process.env.DICTIONARY_HSTS === 'true';
const METRICS_TOKEN = process.env.DICTIONARY_METRICS_TOKEN?.trim() || null;
const HEALTH_WORD = process.env.DICTIONARY_HEALTH_WORD?.trim().toLowerCase() || 'the';

if (IS_PRODUCTION && (!configuredAllowedOrigins || ALLOWED_ORIGINS.includes('*'))) {
  throw new Error('DICTIONARY_ALLOWED_ORIGIN must contain explicit origins in production.');
}

if (IS_PRODUCTION && !PROVIDER_APPROVED) {
  throw new Error('Set DICTIONARY_PROVIDER_APPROVED=true only after the configured provider policy is approved.');
}

if (HSTS_ENABLED && !IS_PRODUCTION) {
  console.warn('DICTIONARY_HSTS is enabled outside production; only use this behind HTTPS.');
}

const cache = new Map();
const inFlight = new Map();
const rateLimits = new Map();
const providerHealth = new Map();
let wiktionaryInFlightCount = 0;
const wiktionaryWaitQueue = [];
const wiktionaryRequestTimestamps = [];
let wiktionaryDrainTimer = null;
const metrics = {
  cacheHits: 0,
  dictionaryRequests: 0,
  responses: {},
  startedAt: new Date().toISOString(),
  upstreamRequests: 0,
};

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function defaultUpstream(provider) {
  if (provider === 'dictionaryapi') return 'https://api.dictionaryapi.dev/api/v2/entries/en';
  if (provider === 'wiktionary') return 'https://en.wiktionary.org/api/rest_v1/page/definition';
  return 'https://api.datamuse.com/words';
}

function acquireWiktionarySlot() {
  if (wiktionaryWaitQueue.length >= WIKTIONARY_MAX_PENDING_REQUESTS) {
    const error = new Error('Wiktionary request queue is full.');
    error.statusCode = 503;
    return Promise.reject(error);
  }

  return new Promise((resolve) => {
    wiktionaryWaitQueue.push(resolve);
    drainWiktionaryQueue();
  });
}

function drainWiktionaryQueue() {
  if (wiktionaryDrainTimer) return;

  let now = Date.now();
  while (wiktionaryRequestTimestamps.length > 0
    && now - wiktionaryRequestTimestamps[0] >= WIKTIONARY_RATE_WINDOW_MS) {
    wiktionaryRequestTimestamps.shift();
  }

  while (wiktionaryWaitQueue.length > 0
    && wiktionaryInFlightCount < WIKTIONARY_MAX_CONCURRENT_REQUESTS
    && wiktionaryRequestTimestamps.length < WIKTIONARY_MAX_REQUESTS_PER_MINUTE) {
    const next = wiktionaryWaitQueue.shift();
    wiktionaryInFlightCount += 1;
    wiktionaryRequestTimestamps.push(now);
    next();

    now = Date.now();
    while (wiktionaryRequestTimestamps.length > 0
      && now - wiktionaryRequestTimestamps[0] >= WIKTIONARY_RATE_WINDOW_MS) {
      wiktionaryRequestTimestamps.shift();
    }
  }

  if (wiktionaryWaitQueue.length > 0
    && wiktionaryInFlightCount < WIKTIONARY_MAX_CONCURRENT_REQUESTS
    && wiktionaryRequestTimestamps.length >= WIKTIONARY_MAX_REQUESTS_PER_MINUTE) {
    const nextAllowedAt = wiktionaryRequestTimestamps[0] + WIKTIONARY_RATE_WINDOW_MS;
    wiktionaryDrainTimer = setTimeout(() => {
      wiktionaryDrainTimer = null;
      drainWiktionaryQueue();
    }, Math.max(1, nextAllowedAt - Date.now()));
  }
}

function releaseWiktionarySlot() {
  wiktionaryInFlightCount = Math.max(0, wiktionaryInFlightCount - 1);
  drainWiktionaryQueue();
}

function requestId(request) {
  const incoming = request.headers['x-request-id'];
  return typeof incoming === 'string' && /^[a-zA-Z0-9._:-]{1,80}$/.test(incoming)
    ? incoming
    : crypto.randomUUID();
}

function setSecurityHeaders(response, isHtml = false) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (isHtml) {
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:;",
    );
  }
  if (HSTS_ENABLED) response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

function isOriginAllowed(request) {
  const requestOrigin = request?.headers?.origin;
  if (!requestOrigin) return true;
  return ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(requestOrigin);
}

function setCorsHeaders(response, request) {
  const requestOrigin = request?.headers?.origin;
  const allowAll = ALLOWED_ORIGINS.includes('*');
  const allowedOrigin = allowAll
    ? '*'
    : requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : null;

  if (allowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  if (!allowAll) {
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}

function sendJson(response, request, statusCode, payload) {
  const body = JSON.stringify(payload);
  recordResponse(statusCode);
  setSecurityHeaders(response);
  setCorsHeaders(response, request);
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Request-Id', request.requestId || requestId(request));
  response.setHeader('Content-Length', Buffer.byteLength(body));
  response.end(body);
}

function recordResponse(statusCode) {
  const key = String(statusCode);
  metrics.responses[key] = (metrics.responses[key] || 0) + 1;
}

function logEvent(event) {
  console.log(JSON.stringify({
    at: new Date().toISOString(),
    ...event,
  }));
}

function getClientAddress(request) {
  if (TRUST_PROXY) {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }
  }
  return request.socket.remoteAddress || 'unknown';
}

function isRateLimited(request) {
  const key = getClientAddress(request);
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(key, { count: 1, startedAt: now });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function getCachedResult(word) {
  const entry = cache.get(word);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(word);
    return null;
  }
  return entry.result;
}

function cacheResult(word, result, ttlMs) {
  if (CACHE_MAX_ENTRIES <= 0 || ttlMs <= 0) return;

  if (cache.size >= CACHE_MAX_ENTRIES && !cache.has(word)) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(word, { expiresAt: Date.now() + ttlMs, result });
}

function getUpstreamHeaders() {
  const headers = {
    Accept: 'application/json',
    'User-Agent': process.env.DICTIONARY_USER_AGENT?.trim()
      || 'MyDictionary/1.0.0 (https://tanukohli09.github.io/my_dictionary/)',
  };
  const apiKey = process.env.DICTIONARY_API_KEY;
  const apiKeyHeader = process.env.DICTIONARY_API_KEY_HEADER || 'X-API-Key';

  if (apiKey) headers[apiKeyHeader] = apiKey;

  if (process.env.DICTIONARY_UPSTREAM_HEADERS) {
    try {
      Object.assign(headers, JSON.parse(process.env.DICTIONARY_UPSTREAM_HEADERS));
    } catch {
      console.warn('Ignoring invalid DICTIONARY_UPSTREAM_HEADERS; expected JSON.');
    }
  }

  return headers;
}

function providerUrl(provider, baseUrl, word) {
  if (provider === 'datamuse') {
    const url = new URL(baseUrl);
    url.searchParams.set('sp', word);
    url.searchParams.set('md', 'd');
    url.searchParams.set('max', '20');
    return url;
  }
  return `${baseUrl}/${encodeURIComponent(word)}`;
}

function cleanDefinitionText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function partOfSpeechLabel(value) {
  const labels = {
    adj: 'adjective',
    adv: 'adverb',
    conj: 'conjunction',
    det: 'determiner',
    interj: 'interjection',
    n: 'noun',
    prep: 'preposition',
    pron: 'pronoun',
    v: 'verb',
  };
  const normalized = String(value || '').trim().toLowerCase();
  return labels[normalized] || normalized || null;
}

function toDictionaryPayload(word, definitions) {
  const grouped = new Map();
  for (const item of definitions) {
    const definition = cleanDefinitionText(item.definition);
    if (!definition) continue;
    const partOfSpeech = partOfSpeechLabel(item.partOfSpeech) || 'definition';
    const group = grouped.get(partOfSpeech) || [];
    group.push({
      antonyms: [],
      definition,
      example: item.example ? cleanDefinitionText(item.example) : null,
      synonyms: [],
    });
    grouped.set(partOfSpeech, group);
  }

  if (!grouped.size) return null;
  return [{
    meanings: Array.from(grouped, ([partOfSpeech, meaningDefinitions]) => ({
      antonyms: [],
      definitions: meaningDefinitions.slice(0, 20),
      partOfSpeech,
      synonyms: [],
    })),
    phonetics: [],
    word: word || 'unknown',
  }];
}

function normalizeDatamuse(data, word) {
  if (!Array.isArray(data)) return null;
  const item = data.find((candidate) => candidate?.word?.toLowerCase() === word) || data[0];
  if (!item?.defs?.length) return null;

  const definitions = item.defs.map((value) => {
    const separator = value.indexOf('\t');
    return separator === -1
      ? { definition: value, partOfSpeech: null }
      : { definition: value.slice(separator + 1), partOfSpeech: value.slice(0, separator) };
  });
  return toDictionaryPayload(item.word || word, definitions);
}

function normalizeWiktionary(data, word) {
  const entries = Array.isArray(data?.en) ? data.en : [];
  const definitions = [];
  for (const entry of entries) {
    for (const item of entry.definitions || []) {
      definitions.push({
        definition: item.definition,
        example: item.examples?.[0]?.text,
        partOfSpeech: entry.partOfSpeech,
      });
    }
  }
  return toDictionaryPayload(word, definitions);
}

function normalizeProviderPayload(provider, data, word) {
  if (provider === 'dictionaryapi') {
    return Array.isArray(data) && data[0]?.meanings?.length ? data : null;
  }
  if (provider === 'wiktionary') return normalizeWiktionary(data, word);
  return normalizeDatamuse(data, word);
}

function errorResult(provider, statusCode, message) {
  return {
    body: JSON.stringify({ message }),
    contentType: 'application/json; charset=utf-8',
    provider,
    statusCode,
  };
}

async function fetchProvider(provider, baseUrl, word) {
  const startedAt = Date.now();
  let timeout;
  let wiktionarySlotAcquired = false;
  let result;

  try {
    if (provider === 'wiktionary') {
      await acquireWiktionarySlot();
      wiktionarySlotAcquired = true;
    }

    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(providerUrl(provider, baseUrl, word), {
      headers: getUpstreamHeaders(),
      signal: controller.signal,
    });
    const body = await response.text();

    if (!response.ok) {
      result = {
        body: body || JSON.stringify({ message: `Dictionary provider returned ${response.status}.` }),
        contentType: response.headers.get('content-type') || 'application/json; charset=utf-8',
        provider,
        statusCode: response.status,
      };
      return result;
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      result = errorResult(provider, 502, 'The dictionary provider returned invalid JSON.');
      return result;
    }

    const normalized = normalizeProviderPayload(provider, data, word);
    if (!normalized) {
      result = errorResult(provider, 404, 'Word not found.');
      return result;
    }

    result = {
      body: JSON.stringify(normalized),
      contentType: 'application/json; charset=utf-8',
      provider,
      statusCode: 200,
    };
    return result;
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    const queueFull = error?.statusCode === 503;
    result = errorResult(
      provider,
      queueFull ? 503 : timedOut ? 504 : 502,
      queueFull
        ? 'The dictionary provider is busy. Please try again shortly.'
        : timedOut
          ? 'The dictionary provider took too long to respond.'
        : 'The dictionary provider is temporarily unavailable.',
    );
    return result;
  } finally {
    if (timeout) clearTimeout(timeout);
    if (wiktionarySlotAcquired) releaseWiktionarySlot();
    const durationMs = Date.now() - startedAt;
    const statusCode = result?.statusCode || 502;
    const previous = providerHealth.get(provider) || { failureCount: 0, status: 'unknown' };
    providerHealth.set(provider, {
      failureCount: statusCode === 200 ? 0 : previous.failureCount + 1,
      lastErrorAt: statusCode === 200 ? previous.lastErrorAt || null : new Date().toISOString(),
      lastLatencyMs: durationMs,
      lastSuccessAt: statusCode === 200 ? new Date().toISOString() : previous.lastSuccessAt || null,
      status: statusCode === 200 ? 'ok' : 'error',
    });
  }
}

async function fetchUpstream(word) {
  metrics.upstreamRequests += 1;
  const primary = await fetchProvider(PROVIDER, UPSTREAM, word);
  let result = primary;

  if (primary.statusCode !== 200 && FALLBACK_PROVIDER && FALLBACK_PROVIDER !== PROVIDER) {
    const fallback = await fetchProvider(FALLBACK_PROVIDER, FALLBACK_UPSTREAM, word);
    if (fallback.statusCode === 200) result = fallback;
  }

  if (result.statusCode === 200) {
    cacheResult(word, result, CACHE_TTL_MS);
  } else if (result.statusCode === 404) {
    cacheResult(word, result, NOT_FOUND_CACHE_TTL_MS);
  }

  return result;
}

async function checkProviderHealth() {
  const primary = await fetchProvider(PROVIDER, UPSTREAM, HEALTH_WORD);
  if (primary.statusCode === 200) return { ok: true, provider: primary.provider, statusCode: primary.statusCode };
  if (FALLBACK_PROVIDER && FALLBACK_PROVIDER !== PROVIDER) {
    const fallback = await fetchProvider(FALLBACK_PROVIDER, FALLBACK_UPSTREAM, HEALTH_WORD);
    if (fallback.statusCode === 200) return { ok: true, provider: fallback.provider, statusCode: fallback.statusCode };
  }
  return { ok: false, provider: primary.provider, statusCode: primary.statusCode };
}

async function proxyLookup(request, response, word) {
  const startedAt = Date.now();
  metrics.dictionaryRequests += 1;
  let result = getCachedResult(word);
  const cacheHit = !!result;
  if (cacheHit) metrics.cacheHits += 1;

  if (!result) {
    let lookup = inFlight.get(word);
    if (!lookup) {
      lookup = fetchUpstream(word);
      inFlight.set(word, lookup);
    }

    try {
      result = await lookup;
    } finally {
      if (inFlight.get(word) === lookup) inFlight.delete(word);
    }
  }

  setCorsHeaders(response, request);
  setSecurityHeaders(response);
  response.statusCode = result.statusCode;
  response.setHeader('Content-Type', result.contentType);
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Dictionary-Provider', result.provider || PROVIDER);
  response.setHeader('X-Request-Id', request.requestId || requestId(request));
  response.setHeader('Content-Length', Buffer.byteLength(result.body));
  response.end(result.body);
  recordResponse(result.statusCode);
  logEvent({
    cacheHit,
    durationMs: Date.now() - startedAt,
    event: 'dictionary_lookup',
    provider: result.provider || PROVIDER,
    requestId: request.requestId,
    statusCode: result.statusCode,
  });
}

function getSafeStaticPath(pathname) {
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decodedPathname.includes('\0')) return null;

  const relativePath = decodedPathname === '/' ? 'index.html' : decodedPathname.replace(/^\/+/, '');
  const candidate = path.resolve(WEB_ROOT, relativePath);
  const rootPrefix = `${WEB_ROOT}${path.sep}`;
  if (candidate !== WEB_ROOT && !candidate.startsWith(rootPrefix)) return null;
  return candidate;
}

async function serveStatic(request, response, requestUrl) {
  let filePath = getSafeStaticPath(requestUrl.pathname);
  if (!filePath) {
    sendJson(response, request, 400, { message: 'Invalid file path.' });
    return;
  }

  try {
    const fileStats = await fs.promises.stat(filePath);
    if (fileStats.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    if (path.extname(requestUrl.pathname)) {
      sendJson(response, request, 404, { message: 'File not found.' });
      return;
    }
    filePath = path.join(WEB_ROOT, 'index.html');
  }

  try {
    const body = await fs.promises.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    setSecurityHeaders(response, extension === '.html');
    setCorsHeaders(response, request);
    response.statusCode = 200;
    response.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');
    response.setHeader(
      'Cache-Control',
      extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    );
    response.setHeader('X-Request-Id', request.requestId || requestId(request));
    response.setHeader('Content-Length', body.length);
    recordResponse(200);
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  } catch {
    sendJson(response, request, 404, { message: 'Web build not found. Run npm run build:web first.' });
  }
}

async function handleRequest(request, response) {
  request.requestId = requestId(request);
  let requestUrl;
  try {
    requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  } catch {
    sendJson(response, request, 400, { message: 'Invalid request URL.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    if (!isOriginAllowed(request)) {
      sendJson(response, request, 403, { message: 'Origin is not allowed.' });
      return;
    }
    setSecurityHeaders(response);
    setCorsHeaders(response, request);
    response.setHeader('X-Request-Id', request.requestId);
    response.statusCode = 204;
    recordResponse(204);
    response.end();
    return;
  }

  if (requestUrl.pathname === '/health' || requestUrl.pathname === '/ready') {
    const deep = requestUrl.pathname === '/ready' || requestUrl.searchParams.get('deep') === 'true';
    const providerCheck = deep ? await checkProviderHealth() : null;
    const ready = !deep || providerCheck?.ok;
    sendJson(response, request, ready ? 200 : 503, {
      cacheEntries: cache.size,
      fallbackProvider: FALLBACK_PROVIDER,
      ok: ready,
      provider: PROVIDER,
      providerApproved: PROVIDER_APPROVED,
      providerCheck,
      providerHealth: Object.fromEntries(providerHealth),
      requestId: request.requestId,
      uptimeSeconds: Math.round(process.uptime()),
      upstream: UPSTREAM,
    });
    return;
  }

  if (requestUrl.pathname === '/metrics') {
    const providedToken = request.headers['x-metrics-token'] || request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!METRICS_TOKEN || providedToken !== METRICS_TOKEN) {
      sendJson(response, request, 404, { message: 'Not found.' });
      return;
    }
    sendJson(response, request, 200, {
      ...metrics,
      cacheEntries: cache.size,
      inFlightRequests: inFlight.size,
      providerHealth: Object.fromEntries(providerHealth),
      uptimeSeconds: Math.round(process.uptime()),
    });
    return;
  }

  if (requestUrl.pathname.startsWith(API_PATH_PREFIX)) {
    if (!isOriginAllowed(request)) {
      sendJson(response, request, 403, { message: 'Origin is not allowed.' });
      return;
    }
    if (request.method !== 'GET') {
      sendJson(response, request, 405, { message: 'Only GET is supported for dictionary lookups.' });
      return;
    }

    const rawWord = requestUrl.pathname.slice(API_PATH_PREFIX.length);
    let word;
    try {
      word = decodeURIComponent(rawWord).trim().toLowerCase();
    } catch {
      sendJson(response, request, 400, { message: 'The word contains invalid characters.' });
      return;
    }

    if (!/^[\p{L}\p{M}][\p{L}\p{M}'’ -]{0,79}$/u.test(word)) {
      sendJson(response, request, 400, {
        message: 'Enter a word using letters, spaces, apostrophes, or hyphens.',
      });
      return;
    }

    if (isRateLimited(request)) {
      response.setHeader('Retry-After', Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
      sendJson(response, request, 429, {
        message: 'Too many dictionary requests. Please try again shortly.',
      });
      return;
    }

    await proxyLookup(request, response, word);
    return;
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    await serveStatic(request, response, requestUrl);
    return;
  }

  sendJson(response, request, 405, { message: 'Method not allowed.' });
}

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimits) {
    if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS);
cleanupTimer.unref();

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    logEvent({ event: 'request_error', message: error?.message || 'unknown', requestId: request.requestId || requestId(request) });
    if (!response.headersSent) sendJson(response, request, 500, { message: 'Unexpected dictionary server error.' });
    else response.destroy();
  });
});

server.requestTimeout = REQUEST_TIMEOUT_MS + 1000;
server.headersTimeout = Math.max(REQUEST_TIMEOUT_MS + 2000, 10_000);
server.keepAliveTimeout = 5_000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Dictionary proxy is already running on ${HOST}:${PORT}`);
    process.exit(0);
  }
  console.error('Dictionary proxy failed to start:', error);
  process.exit(1);
});

function startServer() {
  server.listen(PORT, HOST, () => {
    logEvent({ event: 'server_started', host: HOST, port: PORT, production: IS_PRODUCTION });
    console.log(`Dictionary provider: ${PROVIDER} (${UPSTREAM})`);
    if (FALLBACK_PROVIDER) console.log(`Dictionary fallback: ${FALLBACK_PROVIDER} (${FALLBACK_UPSTREAM})`);
    if (fs.existsSync(path.join(WEB_ROOT, 'index.html'))) console.log(`Serving web build from ${WEB_ROOT}`);
  });
}

function shutdown(signal) {
  if (server.listening) {
    logEvent({ event: 'server_shutdown', signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  startServer();
}

module.exports = {
  checkProviderHealth,
  handleRequest,
  normalizeProviderPayload,
  server,
  startServer,
};
