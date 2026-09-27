# Phase 2 — Backend and Security Hardening

**Project:** My Dictionary
**Phase:** 2 of the production-readiness plan
**Started:** 2026-09-27
**Status:** Technical implementation complete; provider approval and real hosting remain launch gates. Waiting for confirmation before Phase 3.

## Scope

Phase 2 hardened the Node dictionary proxy for a future production deployment. The current provider configuration was not silently approved or replaced. Instead, production startup now requires an explicit provider-approval flag so an unreviewed provider cannot be launched accidentally.

## Completed work

### 1. Production configuration guardrails

Production mode is enabled when `NODE_ENV=production` or `DICTIONARY_ENV=production`.

In production, the server now refuses to start unless:

- `DICTIONARY_ALLOWED_ORIGIN` contains explicit origins and is not `*`;
- `DICTIONARY_PROVIDER_APPROVED=true` is set after provider quality, quota, terms, licensing, and attribution review.

This keeps local development convenient while making unsafe production defaults fail closed.

### 2. Security headers

The proxy now sends:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` disabling camera, microphone, and geolocation
- `Cross-Origin-Opener-Policy: same-origin`
- a restrictive Content Security Policy for the exported web application
- optional HSTS when `DICTIONARY_HSTS=true`

HSTS is intentionally opt-in because it must only be enabled after the service is permanently behind HTTPS.

### 3. CORS protection

- Production requires an explicit allowlist.
- Disallowed API origins receive `403 Origin is not allowed`.
- Allowed preflight requests receive the expected `204` response.
- Local development can continue using `*` in the development environment.

The `DICTIONARY_TRUST_PROXY` setting remains opt-in and is documented for use only when a trusted reverse proxy overwrites `X-Forwarded-For`.

### 4. Request IDs and structured logs

- Every request receives a validated incoming request ID or a generated UUID.
- Responses expose the ID through `X-Request-Id`.
- Dictionary lookups emit structured JSON logs containing request ID, status, provider, cache hit status, and duration.
- Search terms are not written into the structured lookup log.

This gives deployment logs a way to connect a user-visible failure with a specific backend request without putting search words into routine logs.

### 5. Health, readiness, and metrics

The server now exposes:

- `/health` — process-level health and provider state from recent requests;
- `/ready` — performs a live provider check and returns `503` when the configured primary/fallback path cannot return a valid definition;
- `/health?deep=true` — equivalent live provider check;
- `/metrics` — protected counters when `DICTIONARY_METRICS_TOKEN` is configured.

Metrics include dictionary request count, upstream request count, cache hits, response counts, in-flight requests, uptime, and provider health state. The metrics endpoint is not exposed unless a server-side token is configured.

### 6. Server resilience and shutdown

- Request, header, and keep-alive timeouts are configured.
- Unexpected request errors are logged with request IDs and return a safe generic response.
- `SIGINT` and `SIGTERM` now perform graceful server shutdown.
- Static web serving and API responses receive the same baseline security headers.

### 7. Automated backend hardening test

Added [`scripts/test-server-hardening.js`](scripts/test-server-hardening.js), which runs the proxy against a temporary local mock provider and verifies:

- production config rejection for unsafe settings;
- security headers;
- request IDs;
- CSP on the web document;
- successful `/ready` provider check;
- allowed and denied CORS origins;
- dictionary response normalization;
- protected metrics;
- graceful shutdown.

The test uses a mock provider and does not depend on external dictionary availability.

### 8. Documentation and environment settings

Updated:

- [`server/dictionaryProxy.js`](server/dictionaryProxy.js)
- [`.env.example`](.env.example)
- [`README.md`](README.md)
- [`package.json`](package.json)

The README now documents the production approval flag, strict CORS, health/readiness endpoints, metrics, HTTPS/HSTS behavior, and deployment order.

## Verification completed

All of the following passed after the Phase 2 changes:

- `node --check server/dictionaryProxy.js`
- `node --check scripts/test-server-hardening.js`
- `npm run test:server`
- `npm run typecheck`
- `npm run test:phase1`
- `npm run test:review`
- `npm run test:owl`
- `npm run build:web`

## Provider approval status

The current configuration remains:

- primary: Datamuse;
- fallback: Wiktionary;
- client boundary: the hosted Node proxy.

The server now requires `DICTIONARY_PROVIDER_APPROVED=true` in production, but this flag has intentionally not been enabled in the repository’s example environment. Before a real launch, the owner must approve:

- definition and example quality;
- pronunciation/audio coverage;
- request limits and expected cost;
- provider uptime and outage behavior;
- commercial-use terms;
- attribution and share-alike obligations;
- whether fetched definitions may be stored in local backups;
- a provider replacement or migration plan.

Relevant provider references are linked in the production-readiness audit: [Datamuse API](https://www.datamuse.com/api/) and [Wiktionary copyrights](https://en.wiktionary.org/wiki/Wiktionary:Copyrights).

This is a deliberate launch gate, not an implementation failure.

## What was not done in this phase

- No public domain, DNS, TLS certificate, reverse proxy, or hosting platform was configured because no deployment target or credentials were provided.
- No external provider account or API key was created.
- Cache and rate-limit state are still process-local; a multi-instance deployment needs a shared store.
- No external metrics collector, uptime monitor, or alert destination was configured.
- Dependency vulnerabilities identified in the earlier audit remain to be triaged.
- The Playwright navigation harness remains a separate deterministic-test issue.
- Full accessibility, load, mobile-device, and penetration testing remain outstanding.

## Production startup template

After provider and hosting approval, the deployment should supply values equivalent to:

```text
NODE_ENV=production
DICTIONARY_ENV=production
HOST=0.0.0.0
PORT=3000
DICTIONARY_ALLOWED_ORIGIN=https://your-domain.example
DICTIONARY_PROVIDER_APPROVED=true
DICTIONARY_HSTS=true
DICTIONARY_METRICS_TOKEN=<server-side-random-token>
```

`DICTIONARY_HSTS=true` must only be used when HTTPS is guaranteed by the hosting/reverse-proxy layer.

## Phase 2 exit criteria

- [x] Production rejects wildcard CORS.
- [x] Production rejects unapproved provider configuration.
- [x] Security headers and CSP are active.
- [x] CORS allow/deny behavior is tested.
- [x] Request IDs and structured lookup logs are active.
- [x] `/health`, `/ready`, and protected `/metrics` are available.
- [x] Graceful shutdown and server timeouts are configured.
- [x] Backend hardening regression test passes.
- [x] Existing application checks and production web build pass.
- [ ] Real provider policy approval received.
- [ ] Real hosting, HTTPS, monitoring, and rollback are configured.
- [ ] Phase 3 confirmation received.

## Next phase after confirmation

Phase 3 is quality, accessibility, and release verification:

1. Repair and isolate the Playwright test harness.
2. Add lookup success, fallback, timeout, not-found, and retry E2E coverage.
3. Add keyboard, screen-reader, responsive, and mobile-device checks.
4. Run dependency and security triage.
5. Prepare staging smoke tests and a release checklist.

The project is paused here. I will not start Phase 3 until you confirm this Phase 2 technical completion and acknowledge the remaining provider/hosting launch gates.
