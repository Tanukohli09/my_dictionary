# Phase 7 — Controlled Web Beta Readiness

**Date:** 2026-09-29
**Phase:** 7 of the production-readiness plan
**Status:** Implementation, staging deployment, and live beta verification complete; owner gates remain

## Scope

Phase 7 turns the remaining staging and beta checks into a repeatable operator workflow. It stays within the confirmed first-release direction: web-first, English-only, local-first, and backed by the hosted dictionary proxy. It does not add accounts, synchronization, native store distribution, analytics, or a custom domain.

## What this phase delivered

### 1. Read-only live beta smoke contract

Added scripts/beta-smoke.js and the beta:smoke package command. The contract checks:

- process health and explicit provider approval;
- live dictionary-provider readiness;
- exported HTML, CSP, security headers, and exact-origin CORS;
- API preflight behavior;
- representative real words;
- request IDs and provider identity;
- an explicit not-found response;
- optional protected metrics access when an operator supplies a token.

The command requires an explicit BETA_BASE_URL, so it cannot accidentally pass against an unknown local or stale server.

### 2. Beta operations runbook

Added BETA_RUNBOOK.md with:

- pre-invite checks;
- desktop and mobile manual checks;
- the beta acceptance record;
- monitoring guidance for health, readiness, and metrics;
- incident stop criteria;
- a Render rollback procedure;
- the remaining owner-controlled launch gates.

### 3. Security reporting policy

Added SECURITY.md and linked it from Support and the README. It tells users not to place secrets or exploit details in public issues and documents the private-reporting path that the repository owner must enable before a broad public launch.

### 4. CI guard

The quality workflow now checks the beta smoke script syntax on every push and pull request. It does not call the live service from CI and therefore does not expose staging credentials or depend on third-party availability.

## Verification completed

Passed in the isolated Phase 7 candidate:

- node syntax and diff checks;
- npm run typecheck;
- npm run test:phase1;
- npm run test:phase3;
- npm run test:review;
- npm run test:server;
- npm run test:release;
- npm run test:e2e — 16 tests passed;
- beta:smoke against deployed Render commit 8c0d202.

The restricted sandbox initially denied temporary localhost listeners during the server test. The same test passed when rerun with host networking, confirming an environment restriction rather than an application failure.

The final live beta smoke passed against https://my-dictionary-staging.onrender.com at commit 8c0d202 for owl, apply, sesquipedalian, and a deterministic zzzzzzzzzz not-found response. The live browser also showed the Privacy route, Support route, and a real apply lookup with a Datamuse definition.

## Owner-controlled launch gates

- [ ] Enable GitHub private vulnerability reporting.
- [ ] Connect an external uptime monitor to /health and /ready.
- [ ] Connect protected /metrics to an alert destination without exposing its token.
- [ ] Complete real desktop, mobile, keyboard-only, and screen-reader acceptance checks.
- [ ] Approve the privacy, support, and provider-attribution wording for the actual owner and jurisdiction.
- [ ] Decide whether a custom domain is needed before inviting testers.
- [ ] Choose native identifiers only if native distribution is later approved.

These items require an owner account, an external service, a legal/product decision, or a physical device. They are intentionally not faked or silently configured in source control.

## Recommendation

Use the existing Render URL for a small invite-only web beta only after the owner reviews the gates above. Record tester findings using the runbook, keep the metrics token private, and stop inviting users if readiness, lookup success, or data-loss reports degrade.

Phase 7 implementation, staging deployment, and live beta verification are complete. The remaining work is owner-controlled beta approval and external operations setup; no Phase 8 should begin until those gates are accepted or explicitly deferred.
