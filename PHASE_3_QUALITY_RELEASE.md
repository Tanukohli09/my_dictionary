# Phase 3 — Quality, Accessibility, and Release Verification

**Date:** 2026-09-27
**Phase:** 3 of the production-readiness plan
**Status:** Implementation complete; waiting for confirmation before Phase 4

## What this phase delivered

Phase 3 made the release checks deterministic and added coverage for the user-facing lookup path. It also closed the timeout error-mapping bug found by the new browser tests.

### 1. Deterministic browser test environment

- Added [`scripts/start-e2e.js`](scripts/start-e2e.js), which starts the built web app and a local dictionary proxy for Playwright.
- The test proxy uses local mock providers, so tests do not depend on internet availability or a third-party provider quota.
- The mock providers cover successful lookup, primary-provider fallback, not-found, timeout, and transient failure/retry behavior.
- Updated [`playwright.config.js`](playwright.config.js) to use `127.0.0.1`, start the isolated harness, and avoid accidentally reusing an unrelated running server.
- Added shared browser fixtures in [`e2e/testData.js`](e2e/testData.js) so tests start with explicit storage state instead of depending on whoever used the browser last.

### 2. Lookup reliability coverage

- Added [`e2e/lookup.spec.js`](e2e/lookup.spec.js) with end-to-end coverage for:
  - successful dictionary lookup;
  - fallback provider success;
  - not-found messaging;
  - provider timeout messaging;
  - retry recovery after a transient provider failure.
- Fixed [`src/services/dictionaryApi.ts`](src/services/dictionaryApi.ts): an HTTP 504 was being converted into the generic unavailable error because the client did not preserve its own `LOOKUP_TIMEOUT` error code.
- Updated the existing navigation/detail/responsive tests to use stable accessibility labels and deterministic seeded data.

### 3. Accessibility and responsive interaction coverage

Added semantic roles, labels, and selected/disabled state to the primary interactive controls, including:

- mobile tabs and desktop navigation;
- navigation menu and close controls;
- sorting options and alphabet index;
- favourite, pronunciation, back, save, and edit actions;
- search recent-word actions;
- review answers and next-question actions;
- note editor input and save controls.

Added [`e2e/accessibility.spec.js`](e2e/accessibility.spec.js) to verify mobile keyboard/menu access and desktop navigation/theme control names.

## Verification completed

All of the following passed:

- `npm run typecheck`
- `npm run test:phase3`
- `npm run test:e2e` — **14 passed**
- `npm run test:server`
- `npm run test:phase1`
- `npm run test:review`
- `npm run test:owl`
- `npm run build:web` — also executed by `test:e2e`

The release browser suite now runs against an isolated local API and does not require a live dictionary provider.

## Dependency/security status

The current `npm audit --omit=dev --json` refresh could not reach the npm registry because DNS/network access returned `EAI_AGAIN`. The earlier project audit recorded 20 vulnerabilities (8 high, 12 moderate, 0 critical); these remain a release-triage item and were not blindly auto-fixed.

This means the application verification gate is stronger, but dependency triage still needs to run in a networked CI/developer environment before public launch.

## Staging smoke checklist

Before calling the site production-ready, run these against the real staging deployment:

- [ ] Search common words, uncommon words, multi-word terms, apostrophes, and hyphenated words.
- [ ] Verify real provider success, provider fallback, not-found, timeout, rate-limit, and retry behavior.
- [ ] Confirm exact HTTPS CORS origin, CSP, HSTS, `/health`, `/ready`, request IDs, and protected `/metrics`.
- [ ] Confirm provider licensing, quota, attribution, and operational ownership.
- [ ] Test keyboard-only navigation and a screen reader on the deployed build.
- [ ] Test current Chrome, Safari, Firefox, Android Chrome, and iOS Safari at narrow and wide viewports.
- [ ] Run the dependency audit and Expo compatibility check in networked CI.
- [ ] Confirm backups/export behavior, privacy/legal pages, monitoring alerts, and rollback procedure.

## Remaining launch gates

Phase 3 is complete, but the app is not being declared publicly launched yet. The remaining gates carried from Phase 2 and the production assessment are provider approval/licensing, real hosting/TLS, dependency triage, privacy/legal decisions, and the product decision about local-only versus account-backed persistence.

Phase 4 should cover staging deployment, operational monitoring, final release documentation, and launch sign-off. No Phase 4 work has been started.

**Confirmation gate:** confirm Phase 3 completion before Phase 4 begins.
