# Phase 5 — Launch Hardening

**Date:** 2026-09-28
**Phase:** 5 of the production-readiness plan
**Status:** Implementation and staging deployment complete; owner review remains

## What this phase delivered

### 1. Privacy and support access

Added user-facing privacy and support screens that are available:

- before onboarding through `/?screen=privacy` and `/?screen=support`;
- from the onboarding footer;
- from the Profile screen after onboarding.

The screens explain local-first storage, dictionary-provider requests, operational logs, backups, clearing data, safe issue-reporting details, and provider sources. The repository copies are [`PRIVACY.md`](PRIVACY.md) and [`SUPPORT.md`](SUPPORT.md).

The text is a plain-language product notice, not legal advice. It must be reviewed by the owner before a public launch, especially if accounts, analytics, synchronization, ads, or a custom domain are added.

### 2. CI quality gate

Added [`.github/workflows/quality.yml`](.github/workflows/quality.yml). Pushes and pull requests now run:

- TypeScript type checking;
- Phase 3 verification checks;
- server hardening checks;
- the deterministic release smoke contract;
- a dependency audit report uploaded as a workflow artifact.

The audit step remains visible but non-blocking while the Expo major-version upgrade is planned separately.

### 3. Runtime image reduction

The production Docker stage now copies only the built web output and the Node server. It does not install Expo or other build-time npm dependencies in the final runtime image. The runtime server uses Node built-ins only, reducing the deployed attack surface and image size.

### 4. Dependency remediation

The safe, non-breaking `npm audit fix --omit=dev` update was applied. The audit decreased from 20 advisories to 12 advisories: 10 moderate and 2 high.

The remaining high findings are `postcss` and `image-size` in Expo 54's build chain. npm reports that the automatic forced fix would upgrade to Expo 57, which is a breaking major change. That upgrade is intentionally deferred to a dedicated migration phase with native and web regression testing.

## Verification completed

Passed after the Phase 5 changes:

- `npm run typecheck`
- `npm run test:phase3`
- `npm run test:server`
- `npm run test:release`
- `npm run test:e2e` — 16 tests passed, including privacy and support flows

The release smoke build and server checks confirm that the runtime image change does not alter the API contract, health checks, CORS policy, request IDs, or provider fallback behavior.

The verified commit is `2c04f8f` (`Harden launch privacy support and CI`). Render auto-deployed it to [my-dictionary-staging.onrender.com](https://my-dictionary-staging.onrender.com) and reported the service live. The public `/health`, `/ready`, and `/api/dictionary/owl` endpoints returned successfully, and the live Privacy and Support routes were checked at `/?screen=privacy` and `/?screen=support`.

## Remaining launch gates

- [ ] Review and approve the privacy/support wording for the actual owner and jurisdiction.
- [ ] Enable a private GitHub security reporting channel before public launch.
- [ ] Configure external uptime monitoring for `/health` and `/ready`.
- [ ] Keep the protected `/metrics` token in Render and connect it to an alert destination.
- [ ] Complete a dependency upgrade plan for Expo 57 and re-run all native/web tests.
- [ ] Run a small beta test on real mobile and desktop devices.
- [ ] Decide whether to attach a custom domain; Render-managed HTTPS works for staging.
- [x] Confirm Render auto-deploy behavior for future `main` commits.

Phase 5 implementation and staging deployment are complete. The next phase should be the dependency/platform upgrade and final beta launch review, not an untested forced audit fix.
