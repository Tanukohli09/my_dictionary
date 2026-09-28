# Phase 6 — Platform Upgrade and Beta Review

**Date:** 2026-09-29
**Phase:** 6 of the production-readiness plan
**Status:** Implementation complete; staging redeploy and beta owner review remain

## What this phase delivered

### 1. Expo SDK 57 platform upgrade

The project was upgraded from Expo SDK 54 to the stable Expo SDK 57 line using Expo's compatibility workflow:

- Expo `57.0.25` and React Native `0.86.3`;
- React and React DOM `19.2.3`;
- Expo Linear Gradient `57.0.2`;
- Expo Status Bar `57.0.1`;
- Expo Splash Screen `57.0.9`;
- React Native Safe Area Context `5.7.0`;
- TypeScript `6.0.3` and the matching React types.

The old top-level splash configuration was migrated to the supported `expo-splash-screen` config plugin. Generated native folders and placeholder `com.anonymous.mydictionary` identifiers were intentionally not committed; real iOS and Android identifiers require an owner decision before native store builds.

### 2. Compatibility fixes

The upgrade also fixed the issues exposed by the new toolchain:

- removed the unsupported `backgroundColor` prop from `expo-status-bar`;
- replaced the removed `StyleSheet.absoluteFillObject` type with `StyleSheet.absoluteFill`;
- added Node types for the existing Expo environment-variable access;
- updated AsyncStorage test mocks for TypeScript 6's CommonJS interop behavior.

### 3. Stronger CI gate

The quality workflow now runs Expo Doctor, Phase 1 and Phase 3 checks, review checks, mascot checks, type checking, the web build, server hardening, and the release smoke contract. The dependency audit remains uploaded as an artifact without applying an unsafe forced fix.

### 4. Beta launch review

This phase confirms that the current release is suitable for a controlled web beta on the existing Render staging service. It does not claim that the app is ready for an unrestricted public or native-store launch.

## Verification completed

Passed against the isolated SDK 57 candidate:

- `npx expo-doctor` — 21/21 checks passed;
- `npx expo prebuild --no-install` — native config plugins completed successfully; generated native output was discarded because identifiers are not final;
- `npm run typecheck`;
- `npm run test:phase1`;
- `npm run test:phase3`;
- `npm run test:review`;
- `npm run test:owl`;
- `npm run test:server`;
- `npm run test:release`;
- `npm run test:e2e` — 16 tests passed;
- `npm audit --omit=dev --audit-level=high` — 11 moderate, 0 high, 0 critical production findings.

The audit findings are in Expo's build/configuration toolchain and `uuid` transitive dependencies. npm's suggested automatic fix is not an appropriate release action because it proposes a major framework change; the dependency graph should be revisited during the next planned Expo upgrade.

## Beta launch gates still requiring owner action

- [ ] Review and approve the privacy, support, and provider-attribution wording.
- [ ] Enable private GitHub security reporting.
- [ ] Connect `/health` and `/ready` to an uptime monitor.
- [ ] Connect protected `/metrics` to an alert destination and keep its Render secret private.
- [ ] Test the live staging service on at least one real desktop browser and one real mobile device.
- [ ] Run real-word lookups, including common words, uncommon words, misspellings, provider timeout, and provider fallback cases.
- [ ] Decide whether the web beta needs a custom domain before inviting testers.
- [ ] Choose real iOS bundle and Android package identifiers before any native store build.

## Recommendation

Proceed with a small invite-only web beta on the existing staging URL after the owner reviews the gates above. Keep the release web-first and local-first. Do not advertise native store availability or promise multi-device synchronization until the identifiers, native builds, accounts, monitoring, and data model are intentionally configured.

Phase 6 implementation is complete. The next step is staging redeployment and owner beta approval; no further phase should begin until the beta gates are accepted or explicitly deferred.
