# Phase 0 — Product and Provider Decisions

**Project:** My Dictionary
**Phase:** 0 of the production-readiness plan
**Prepared:** 2026-09-27
**Status:** Confirmed by owner on 2026-09-27.

## Purpose

Phase 0 establishes what we are launching before changing the application. These decisions affect storage, privacy, backend design, provider contracts, testing, deployment, and support. Starting implementation without them could create rework or promise behavior the current architecture does not support.

## Current understanding

My Dictionary is currently:

- an Expo/React Native + React Native Web application;
- primarily a responsive website at this stage;
- local-first, with saved words, notes, favourites, review history, theme, and onboarding stored in browser/device storage;
- backed by a Node dictionary proxy for remote lookup;
- configured to use Datamuse as the primary provider and Wiktionary as a fallback;
- not yet an account-based or multi-device synchronized service;
- not yet ready for unrestricted public launch.

## Recommended first-release decisions

These are my recommended defaults for a safe, focused first release.

### 1. Release target: web-first

**Recommendation:** Launch the responsive website first. Defer iOS and Android store releases until the web product, backend, provider, and support process are stable.

**Reason:** The current user request is focused on making the website usable. A web-first release avoids adding native signing, store review, mobile package identifiers, native permissions, and two more release pipelines before the core product is proven.

### 2. User model: local-first without accounts for the first release

**Recommendation:** Do not add login or cloud synchronization in the first web release. Present the product honestly as a personal dictionary whose saved data stays in the current browser/device.

**Required before public release:**

- visible explanation that data is local to the browser/device;
- export and import of saved words, notes, favourites, and review history;
- clear-data and delete-word actions with confirmation;
- a storage error state that does not silently look like an empty collection;
- versioned migrations for future local data changes;
- privacy and third-party search disclosure.

**Later:** Add accounts and sync only if multi-device use becomes a confirmed product requirement.

### 3. Initial content scope: English dictionary

**Recommendation:** Release with English lookup only, while keeping the code structured so language support can be added later.

**Reason:** The current API path, UI copy, provider configuration, and data model are English-oriented. Supporting multiple languages now would expand provider selection, pronunciation, storage, search, testing, and legal requirements.

### 4. Provider policy: hosted proxy, approved provider before public launch

**Recommendation:** Keep the server proxy as the single lookup boundary for web and future native clients. Treat the current Datamuse/Wiktionary setup as staging-capable, not automatically launch-approved.

Before public launch, we must approve:

- definition and example quality;
- pronunciation/audio coverage;
- request quotas and expected cost;
- uptime and rate-limit behavior;
- terms of use and commercial use;
- attribution requirements;
- whether provider content can be stored in the user’s local collection;
- a fallback policy for provider outages;
- a response contract that can be tested without depending on live services.

Datamuse documentation describes it as a word-finding service and notes limitations around rich definitions/examples. Wiktionary content has attribution and share-alike obligations. The audit therefore recommends provider approval as a launch gate, not as an assumption.

### 5. First launch shape: one hosted web/API service

**Recommendation:** Start with one HTTPS deployment serving both the compiled web app and `/api/dictionary/:word`.

**Reason:** Same-origin web and API deployment is simpler for the first release, avoids browser CORS complexity, and ensures the production web app uses the controlled proxy rather than calling a provider directly.

The service still needs strict production CORS, security headers, rate limiting, logs, monitoring, a health check, backups where applicable, and a rollback procedure.

## Decisions requiring your confirmation

Please confirm these recommended choices or change any of them:

| Decision | Recommended choice | Your confirmation |
|---|---|---|
| First release | Responsive website only; mobile stores later | Confirmed |
| User data | Local-first, no accounts initially; export/import required | Confirmed |
| Language | English only initially | Confirmed |
| Dictionary API | Hosted proxy; current providers are staging-only until quality/legal review | Confirmed |
| Deployment | One HTTPS service serving web build and dictionary API | Confirmed |

## Phase 0 completion criteria

Phase 0 is complete when:

- the five decisions above are confirmed;
- the privacy/data promise matches the actual storage behavior;
- the dictionary provider is either approved for launch or explicitly marked as a pre-launch blocker;
- the first-release scope is written down and will not expand during Phase 1;
- the next phase has a fixed implementation boundary.

## Phase 1 result

After confirmation, Phase 1 implemented product correctness within the confirmed scope:

1. Fix clean-install onboarding behavior.
2. Remove fake/demo progress from public user flows.
3. Make profile metrics reflect real activity.
4. Add delete-word and clear-data flows.
5. Add local data export/import if local-first is confirmed.
6. Add clear storage/network error and retry states.
7. Add provider/source attribution placeholders or UI according to the approved provider policy.
8. Add the Phase 1 completion report and pause for the next confirmation.

See [`PHASE_1_PRODUCT_CORRECTNESS.md`](PHASE_1_PRODUCT_CORRECTNESS.md) for the implementation details and verification results.

## Owner action

Phase 0 has been confirmed. Phase 1 implementation and its completion report are recorded in [`PHASE_1_PRODUCT_CORRECTNESS.md`](PHASE_1_PRODUCT_CORRECTNESS.md).

For future scope changes, reply with the decisions you want changed, for example: “Add accounts and sync now,” “support mobile stores in the first release,” or “use a different provider strategy.”
