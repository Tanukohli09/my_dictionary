# Phase 4 — Staged Release and Launch Preparation

**Date:** 2026-09-27
**Phase:** 4 of the production-readiness plan
**Status:** Local launch preparation complete; external staging deployment is still pending

## What this phase delivered

Phase 4 added the repeatable artifacts needed to deploy and verify a staging instance. The implementation is host-agnostic because this project does not yet have a selected cloud host, domain, provider account, or deployment credentials.

### 1. Release smoke check

Added [`scripts/release-smoke.js`](scripts/release-smoke.js) and the `npm run release:smoke` command.

Against a configured staging URL, it checks:

- `/health` process health;
- `/ready` provider readiness;
- exported HTML availability and security headers;
- one real dictionary lookup;
- exact-origin CORS;
- backend request IDs;
- optional expected provider identity.

The check fails closed when readiness or the dictionary lookup fails. It is designed for a deployment pipeline, uptime check, or post-deploy command.

### 2. Deterministic release contract

Added [`scripts/test-release-smoke.js`](scripts/test-release-smoke.js) and `npm run test:release`. This starts the isolated local server, runs the same release smoke check used for staging, and shuts the server down cleanly.

This gives the project a local proof that the release check itself works before it is pointed at a real host.

### 3. Container deployment artifact

Added:

- [`Dockerfile`](Dockerfile) — multi-stage Node 20 image that builds the Expo web bundle and runs the hardened dictionary proxy;
- [`.dockerignore`](.dockerignore) — excludes local dependencies, generated output, test artifacts, and environment secrets.

The image expects production configuration at runtime, including explicit CORS and `DICTIONARY_PROVIDER_APPROVED=true`. No provider secret is baked into the image.

### 4. Deployment documentation

Updated [`README.md`](README.md) with:

- container build/run commands;
- staging smoke-check usage;
- the release contract command;
- the distinction between local deterministic mocks and real staging provider verification.

### 5. Render staging configuration

Added [`render.yaml`](render.yaml), a Render Blueprint for a Free-plan staging web service. It uses the Dockerfile, binds Render’s expected port `10000`, configures `/health`, and keeps the allowed origin and provider approval as dashboard-supplied values rather than committing them to source control.

The Render Blueprint was parsed successfully locally. The Render Dashboard is open and waiting for account sign-in; no service has been created yet.

## Verification completed

Passed:

- `node --check scripts/release-smoke.js`
- `node --check scripts/test-release-smoke.js`
- `npm run typecheck`
- `npm run test:phase3`
- `npm run test:release`
- web bundle export inside `test:release`
- Render Blueprint YAML parse

The local release smoke output verified `/health`, `/ready`, HTML security headers, CORS, request IDs, and a successful dictionary response through the isolated proxy.

## What could not be completed locally

The Docker build was attempted but the environment denied access to `/var/run/docker.sock`. The Dockerfile is present and syntax-reviewed, but an actual image build still needs to run on a machine or CI runner with Docker access.

No real staging deployment was created because the project does not yet specify:

- a hosting provider or deployment target;
- a staging domain and DNS/TLS ownership;
- the approved dictionary provider and fallback policy;
- production/staging provider credentials;
- an external metrics, uptime, or alert destination.

The Render setup flow is now ready, but the dashboard requires the owner to sign in and connect the repository before it can create the service.

These require user-owned accounts or deployment authority and cannot be safely inferred.

## Staging runbook

When a host is selected:

1. Build and publish the image with the host’s container registry.
2. Supply a secret-managed environment equivalent to:

   ```text
   NODE_ENV=production
   DICTIONARY_ENV=production
   HOST=0.0.0.0
   PORT=3000
   DICTIONARY_WEB_ROOT=/app/dist
   DICTIONARY_ALLOWED_ORIGIN=https://staging.example.com
   DICTIONARY_PROVIDER_APPROVED=true
   DICTIONARY_HSTS=true
   DICTIONARY_METRICS_TOKEN=<secret>
   ```

3. Put the service behind HTTPS and configure the platform health check to use `/health`.
4. Run the post-deploy check:

   ```bash
   RELEASE_BASE_URL=https://staging.example.com \
   RELEASE_WEB_ORIGIN=https://staging.example.com \
   RELEASE_SMOKE_WORD=owl \
   npm run release:smoke
   ```

5. Verify `/ready`, logs, metrics, provider quota, latency, and error alerts.
6. Invite a small tester group and record lookup failures, confusing definitions, accessibility issues, and data-loss reports.
7. Roll back to the prior image if smoke checks fail or lookup reliability degrades.

## External launch gates

- [x] Repeatable post-deploy smoke command exists.
- [x] Local release contract passes.
- [x] Container deployment artifact exists.
- [x] Render Blueprint exists and uses the expected web-service port/health check.
- [x] Runtime secrets remain external to the image.
- [ ] Docker image build verified on a Docker-capable CI/host.
- [ ] Real staging host and domain selected.
- [ ] HTTPS/DNS configured.
- [ ] Provider and fallback policy approved.
- [ ] Staging provider credentials configured.
- [ ] External monitoring and alerting configured.
- [ ] Dependency audit completed in networked CI.
- [ ] Beta tester sign-off received.
- [ ] Privacy/support links published.

Phase 4 local implementation is complete, but public launch is not yet approved. The next action is external deployment setup, not more application feature work.
