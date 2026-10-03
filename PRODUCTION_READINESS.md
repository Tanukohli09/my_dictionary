# My Dictionary: Production Readiness Audit

**Audit date:** 2026-09-27
**Project:** My Dictionary
**Status:** Assessment only — no application source code or configuration was changed for this audit.

## Executive summary

My Dictionary is a polished Expo/React Native prototype with a responsive web interface, local saved-word storage, review practice, notes, favourites, theme support, and a dictionary lookup service. The core experience is understandable and the current lookup path can return definitions for common words.

It is not ready for an unrestricted public launch yet. The largest launch risks are not visual polish; they are product scope, dictionary-provider reliability and licensing, persistence and account expectations, production infrastructure, legal disclosures, accessibility, and release verification.

The most important decision is this:

> Is the first release a local-only personal dictionary, or a real account-based service that synchronizes a user’s words across devices?

The current app is local-first. Saved words, notes, review history, theme choice, and onboarding state live in browser/device storage. That is acceptable for a clearly described personal tool, but it is not the same as a multi-device production service.

The second major decision is the dictionary data source. The current server uses Datamuse by default and Wiktionary as a fallback. Datamuse’s official documentation describes it primarily as a word-finding API, says it does not provide rich definitions and examples, and documents a future requirement for an API key after January 1, 2027. Wiktionary content has attribution and share-alike obligations. This provider arrangement needs a deliberate product, legal, and reliability decision before launch.

## What the project currently is

### Technology and runtime

- Expo SDK 54 with React Native and React Native Web.
- TypeScript application with custom navigation rather than React Navigation.
- Web development server and a Node dictionary proxy.
- AsyncStorage for local persistence on web and native.
- Playwright browser tests plus lightweight Node test scripts.
- Responsive desktop layout with a mobile-oriented `PhoneFrame` presentation.
- Dark, illustrated learning-product visual design centered around an owl mascot.

Important project files:

- [`App.tsx`](App.tsx) — application providers and root setup.
- [`src/navigation/AppNavigator.tsx`](src/navigation/AppNavigator.tsx) — route state, hydration, saved-word state, and screen composition.
- [`src/services/dictionaryApi.ts`](src/services/dictionaryApi.ts) — client-side lookup transport and response handling.
- [`src/modules/savedWordCollection.ts`](src/modules/savedWordCollection.ts) — search, save, favourite, note, and review operations.
- [`src/services/wordStorage.ts`](src/services/wordStorage.ts) — AsyncStorage persistence.
- [`server/dictionaryProxy.js`](server/dictionaryProxy.js) — dictionary proxy, fallback providers, cache, rate limiting, and static web serving.
- [`app.json`](app.json) — current Expo application metadata.
- [`package.json`](package.json) — scripts and dependency versions.

### Current user journey

1. The app loads and hydrates onboarding state and saved words.
2. A user submits a word from the Search screen.
3. The app checks local saved words first.
4. If the word is not local, the client calls the dictionary service.
5. The server calls the configured provider, normalizes the response into the app’s `WordEntry` shape, and may use a fallback provider.
6. The result is saved locally and displayed.
7. The user can favourite the word, add a personal meaning or note, and later review saved words.
8. The Dictionary screen searches and sorts the local collection.
9. The Review screen creates a local quiz from saved words.
10. The Profile screen shows progress and learning statistics.

The main flow is coherent. The distinction to keep in mind is that “dictionary search” is remote, while “dictionary management,” “review,” and “profile” are currently local-device features.

## What is already in good shape

- The app has a clear product concept and recognizable visual identity.
- The web layout adapts between desktop navigation and a compact mobile-style layout.
- The lookup client has explicit states for loading, not found, timeout, rate limiting, and generic errors.
- The server proxy provides a single place for provider selection, normalization, timeout handling, cache, in-flight request deduplication, CORS, and basic rate limiting.
- Search results are converted into a consistent internal model rather than being rendered directly from one provider’s response shape.
- Saved words, notes, favourites, and review submissions have dedicated modules instead of being scattered across every screen.
- Review-session logic and several layout/history behaviors have automated checks.
- The web production bundle can currently be generated with `npm run build:web`.
- The application can run without requiring a dictionary API secret in the client bundle.

These are strong foundations. The next work should harden the boundaries around them rather than redesign the entire app.

## Current architecture and important limitations

### Navigation and browser behavior

Navigation is a custom reducer plus a lightweight URL projection. It is adequate for the current screen flow, but it is not yet a complete web routing system.

Risks before public web launch:

- Browser Back and Forward behavior is not a complete first-class navigation contract.
- Deep links to a particular word are not represented as stable, shareable word URLs.
- Refreshing a route relies on the app’s hydration behavior rather than a full route loader.
- Native Android Back and iOS navigation semantics need device testing.
- Screen names are projected into the query string, but the word identity and user-visible state are not fully encoded.

For a public website, a user should be able to copy a URL for a word, refresh it, use browser navigation, and return to the same meaningful state.

### Local persistence

The current storage model uses versioned-looking AsyncStorage keys such as `my-dictionary.words.v1`, but there is not yet a complete migration framework.

Current implications:

- Data is tied to one browser profile or one device installation.
- Clearing browser storage removes the user’s collection.
- There is no account, sync, cloud backup, export, or import flow.
- There is no visible “clear all data” or “delete my data” flow even though storage operations exist.
- Malformed or partial storage is now detected and surfaced through the Phase 23 recovery notice; a full versioned migration framework remains outstanding.
- The in-progress review session is not durable across reloads or app restarts.
- Phase 23 now validates persisted collections, preserves a user-scoped recovery copy for malformed or partial data, and shows a recovery path instead of presenting corruption as a healthy empty collection.
- There is still no full schema-migration framework for future `WordEntry` changes; upgrade scenarios must be tested before changing the stored shape.

This must be clearly positioned. If the product is local-only, add export/import and transparent storage messaging. If it is intended to be a service for real users, introduce authentication, a server-side user model, sync conflict rules, backups, and account deletion.

### Dictionary lookup

The current server is a useful development and deployment foundation, but it should not yet be treated as a final dictionary platform.

Current strengths:

- Provider selection is configurable.
- Datamuse and Wiktionary responses are normalized into the app model.
- There is a fallback path.
- The server has timeout handling, caching, in-flight deduplication, CORS handling, and a health endpoint.

Launch concerns:

- The default provider is not a guaranteed long-term source for rich dictionary definitions, examples, pronunciation, and audio.
- The fallback is an external Wikimedia/Wiktionary source whose content and licensing obligations must be represented in the product.
- The server cache and rate limiter are in memory; they disappear on restart and are not shared between multiple instances.
- `/health` reports process health but does not prove that the upstream dictionary provider is reachable or returning valid data.
- There are no request IDs, structured logs, provider latency metrics, error-rate alerts, or an operator dashboard.
- The proxy does not itself terminate HTTPS; production deployment must put it behind a TLS-enabled host or reverse proxy.
- CORS currently permits a permissive default. Production should use the exact deployed web origin.
- The native client can still use a direct provider URL when a hosted API URL is not supplied. A production native build should point to the controlled hosted backend so web and native behavior are consistent.
- There is no contract test suite covering each provider’s real or mocked response shape, fallback selection, timeout, malformed payload, and attribution metadata.

Datamuse’s official API documentation is especially important for planning: [Datamuse API](https://www.datamuse.com/api/). Wiktionary licensing should be reviewed before shipping content from that source: [Wiktionary copyrights](https://en.wiktionary.org/wiki/Wiktionary:Copyrights).

### Product data quality and demo leakage

Several parts of the UI still behave like a design prototype rather than a public product:

- The word of the day is a fixed sample rather than a real date-based or server-selected feature.
- The Search screen’s “recently added” section includes hardcoded sample words when there are not enough saved words, and those entries are not fully interactive.
- Profile statistics can switch to hardcoded demo values when demo data is present.
- The current streak is displayed as a fixed seven-day value rather than being calculated from review activity.
- Review attempts and reviewed answers are not clearly separated as product metrics.
- The favourites profile action navigates to the Dictionary screen but does not directly apply the favourites filter.
- A development/demo filtering rule remains in the dictionary list module.

Public users must never be shown progress that looks like their own activity but is actually sample data. Either remove demo content from production, label it unmistakably as sample content, or seed it only in an explicit demo mode.

### Onboarding and first-run behavior

An onboarding screen exists, but the current “no stored key means already onboarded” behavior causes a clean install to skip onboarding. Decide whether onboarding is required; if it is, a new installation should enter onboarding deterministically.

Onboarding should also explain:

- whether saved words stay only on this device;
- whether searches are sent to a third-party dictionary provider;
- how a user can export or delete their data;
- what the review feature does;
- whether audio and definitions may vary by provider.

### Accessibility and interaction quality

The application has some accessibility labels and roles, but coverage is incomplete. Before public launch, audit every interactive control with keyboard and screen-reader navigation.

Known areas to address:

- Search input needs a proper accessible label and submit behavior.
- Icon-only controls such as back, audio, bookmark, menu, and save need accessible names and state announcements.
- Bookmark controls need an explicit selected/pressed state.
- Word cards, review answers, sort options, and bottom-tab items need semantic roles and selected state.
- Focus should move predictably after search, errors, navigation, and modal-like editing.
- Text contrast, tap target size, zoom behavior, and reduced-motion behavior need a deliberate check.
- Audio links need failure feedback and safe URL handling.

### Error and resilience behavior

The lookup error states are a good start, but a production app also needs resilience around the rest of the application:

- Add an application-level error boundary with a recoverable fallback screen.
- Distinguish an empty collection from a storage read failure.
- Show save/update failures instead of silently leaving the UI stale.
- Add a visible retry action for provider failures.
- Define what happens if a result is returned but is missing a definition, pronunciation, or example.
- Handle offline mode intentionally rather than relying on a generic network error.
- Prevent duplicate submissions and repeated taps while mutations are in progress.

## Priority findings

| Priority | Finding | Why it matters | Recommended outcome |
|---|---|---|---|
| P0 | Product scope is not defined | Local-only and account-based products have different architecture, privacy, support, and launch requirements | Decide first-release scope and document it in the product requirements |
| P0 | Dictionary provider is not a final commercial/reliability decision | Provider availability, quality, quota, attribution, and licensing can invalidate a launch | Select a primary provider or licensed dataset; approve fallback and attribution |
| P0 | Public API deployment is not defined | The web bundle alone cannot provide dictionary results | Deploy the API and web app together or document a separate API deployment |
| P0 | Demo values and fixed progress remain in user-facing screens | Users can be misled about their activity | Remove or explicitly isolate demo data before release |
| P0 | Onboarding is skipped for a clean install | New users may miss the product explanation and consent messaging | Fix first-run state and test a clean profile |
| P0 | Production security and operations are incomplete | Open CORS, missing security headers, no alerts, and in-memory controls increase abuse and outage risk | Use HTTPS, strict CORS, headers, logs, metrics, alerts, and quota protection |
| P0 | Store/web identity metadata is incomplete | Native stores require unique application IDs and release metadata | Add bundle/package identifiers, icons, splash assets, support/privacy URLs, and release versioning |
| P0 | Lookup contract coverage is missing | A provider response change can break search silently | Add mocked provider contract, fallback, timeout, malformed response, and UI E2E tests |
| P1 | No sync, export, import, or account deletion | Users can lose their collection and cannot move it between devices | Add export/import for local mode, or accounts/sync for a service mode |
| P1 | Browser deep links and history are incomplete | Public web users expect refreshable and shareable URLs | Use a real route model for word detail and test Back/Forward/refresh |
| P1 | Accessibility audit is incomplete | Keyboard and assistive-technology users may not be able to use core flows | Add semantic labels, focus management, contrast/tap-target checks, and automated checks |
| P1 | Observability is missing | Provider outages and slow searches may go unnoticed | Add request IDs, structured logs, latency/error metrics, uptime checks, and alerting |
| P1 | Review and profile metrics are incomplete | The learning promise depends on trustworthy progress | Implement real streak, session, mastery, and favourite calculations |
| P2 | Autocomplete, typo correction, and richer word pages | These improve discovery and retention after the core is reliable | Add suggestions, related words, richer examples, audio, and source links |
| P2 | Notifications and advanced learning features | Useful for retention but not required for the first safe launch | Add spaced repetition scheduling, reminders, lists, and sharing later |

## What to add for a user-ready product

### Must-have for the first public release

- A clear local-only versus account-based product promise.
- A production-approved dictionary provider with documented quota, uptime expectations, content quality, and licensing.
- Provider attribution and a source link on definition pages where required.
- A hosted API with HTTPS, strict CORS, timeouts, caching, rate limits, and provider monitoring.
- A real first-run onboarding flow.
- No fake user statistics, fixed streaks, or unmarked demo words.
- Search retry, offline/error behavior, and clear “word not found” states.
- Export/import or a deliberate account-sync implementation.
- Delete-word and clear-data flows with confirmation.
- Privacy policy, terms, support contact, and third-party provider disclosure.
- Accessible labels and keyboard/screen-reader operation for every core action.
- Crash/error reporting and an operational alert path.
- Deterministic automated tests for lookup, persistence, navigation, responsive layouts, and the release build.

### Valuable shortly after launch

- Autocomplete and typo-tolerant suggestions.
- Search history with privacy controls.
- Word-of-the-day selection from a real source.
- Multiple definitions, examples, synonyms, antonyms, pronunciation, and audio quality improvements.
- A real favourites-only view.
- Spaced-repetition scheduling instead of only a random/local quiz.
- Account sync and multi-device restore if the product direction requires it.
- Import from a file and export to JSON/CSV.
- Feedback/report-a-definition flow.
- Product analytics with consent and a privacy review.

### Later product opportunities

- Custom collections and tags.
- Multiple languages.
- Shareable word pages.
- Collaborative lists or classroom mode.
- Reminders and push notifications.
- Offline dictionary packs with a properly licensed dataset.
- Paid plans only after provider cost, privacy, and support economics are understood.

## Launch architecture options

### Option A: one web service for the first release

Build the Expo web app into `dist`, then run the existing Node server so it serves both the static web app and `/api/dictionary/:word`.

Production shape:

```text
Browser -- HTTPS --> reverse proxy / hosting --> Node dictionary server
                                                ├── static dist/
                                                └── /api/dictionary/:word --> provider
```

This is the simplest initial deployment because the browser and API can share one origin. It still needs a real domain, TLS, strict CORS, environment-specific provider settings, process supervision, health checks, logs, and a rollback procedure.

### Option B: static web host plus separate API

Host `dist` on a static/CDN platform and deploy the dictionary proxy as a separate service. Set the production `EXPO_PUBLIC_DICTIONARY_API_URL` to the API URL and configure exact-origin CORS.

This can scale independently, but it introduces cross-origin configuration, two deployment pipelines, and more operational surface area.

### Option C: web plus native applications

Keep a hosted API for both clients. Configure unique iOS and Android identifiers, app icons, splash assets, version/build numbers, privacy/support URLs, and store metadata. Use EAS Build for signed binaries and EAS Submit for store delivery.

Expo’s official guidance covers [publishing websites](https://docs.expo.dev/guides/publishing-websites/), [application configuration](https://docs.expo.dev/versions/latest/config/app/), and [EAS Build setup](https://docs.expo.dev/build/setup/). EAS documentation also covers [store distribution](https://docs.expo.dev/distribution/introduction/).

## Release plan

### Phase 0 — product and provider decisions

1. Decide web-only, native, or both for the first release.
2. Decide local-only versus accounts and sync.
3. Select and approve the dictionary provider and fallback.
4. Review provider terms, attribution, privacy, quotas, and expected cost.
5. Define supported language(s), minimum result quality, and a “word not found” policy.
6. Write a short product requirements document and a launch definition of done.

### Phase 1 — product correctness

1. Fix first-run onboarding.
2. Remove demo leakage and calculate real profile values.
3. Add delete-word, clear-data, export, and import behavior for local mode.
4. Add retry and offline states.
5. Add provider attribution/source links.
6. Make browser/native navigation and deep links reliable.
7. Add an error boundary and explicit storage error states.

### Phase 2 — production backend and security

1. Deploy the API behind HTTPS.
2. Set strict production CORS and security headers.
3. Move cache/rate-limit state to a shared store if more than one instance will run.
4. Add request IDs, structured logs, metrics, uptime checks, and alerts.
5. Add provider quota monitoring and an operational fallback policy.
6. Keep all provider keys and secrets on the server; never ship them in `EXPO_PUBLIC_*` variables.
7. Add graceful shutdown, process supervision, backups where applicable, and rollback documentation.

### Phase 3 — quality and accessibility

1. Add dictionary-provider contract tests and server tests.
2. Add lookup E2E tests for success, fallback, timeout, not found, and retry.
3. Make Playwright tests isolated and deterministic with clean storage fixtures.
4. Test mobile viewport, desktop viewport, keyboard-only use, and screen readers.
5. Run performance checks with a realistic saved-word collection.
6. Triage dependency vulnerabilities and upgrade within the Expo-compatible support window.

### Phase 4 — staged release

1. Deploy a staging environment.
2. Run smoke tests against the real hosted API and provider configuration.
3. Invite a small group of testers.
4. Monitor lookup success rate, latency, errors, storage failures, and crash reports.
5. Fix launch-blocking issues and document rollback.
6. Release publicly with support and privacy links visible.
7. Review real usage and provider costs before adding growth features.

## Deployment checklist

### Application

- [ ] Product scope is written and matches the UI.
- [ ] Demo data and fake progress are removed from production.
- [ ] First-run onboarding works in a clean browser/device profile.
- [ ] Search success, not-found, timeout, offline, retry, and fallback states are tested.
- [ ] Word detail, notes, favourites, delete, review, and profile metrics are correct.
- [ ] Browser refresh, Back, Forward, and shareable word URLs work.
- [ ] Native Back behavior is tested if mobile apps are shipped.
- [ ] Error boundary and storage error recovery exist.

### Data and privacy

- [ ] Local-only or account-based behavior is explicit.
- [ ] Export/import or cloud sync is implemented as promised.
- [ ] Clear-data, delete-word, and account-deletion behavior is documented.
- [ ] Privacy policy describes saved data, searches, analytics, crash reports, and third parties.
- [ ] Provider attribution and license obligations are satisfied.
- [ ] Support contact and feedback path are available.

### Backend and operations

- [ ] Production provider and fallback are approved.
- [ ] Provider quotas, costs, and terms are monitored.
- [ ] API is behind HTTPS.
- [ ] CORS is restricted to known origins.
- [ ] Security headers are configured.
- [ ] Secrets are server-side only.
- [ ] Logs, metrics, request IDs, alerts, and uptime checks are active.
- [ ] Cache/rate-limit behavior is appropriate for the number of instances.
- [ ] Health checks distinguish process health from provider health where needed.
- [ ] Rollback and incident procedures are written.

### Release engineering

- [ ] Typecheck passes.
- [ ] Unit/module tests pass.
- [ ] Server contract tests pass.
- [ ] Lookup E2E tests pass.
- [ ] Responsive and accessibility checks pass.
- [ ] Production web build passes.
- [ ] Dependency audit has been triaged.
- [ ] Staging smoke test passes.
- [ ] Web domain/DNS/TLS are configured.
- [ ] Native package identifiers, icons, splash screen, store metadata, and signing are configured if applicable.

## Verification performed during this audit

The following checks were run against the current project:

- `npx expo config --json` — passed.
- `npm run typecheck` — passed.
- `npm run test:review` — passed.
- `npm run test:owl` — passed.
- `npm run build:web` — passed.
- Dictionary proxy health and representative lookups for `owl` and `apply` — passed through the local proxy.
- `npm run test:navigation` — did not reach the tests; Expo/freeport failed with `ERR_SOCKET_BAD_PORT` after selecting port `65536`. The E2E command needs to be made deterministic before it can be used as a release gate.
- `npm audit --omit=dev --json` — reported 20 vulnerabilities: 8 high and 12 moderate, with no critical findings. These need dependency-level triage; they should not be ignored or blindly fixed with a major framework upgrade.
- `npx expo-doctor` — could not be completed because the environment could not reach the npm registry (`EAI_AGAIN`). Run it again in a networked CI or developer environment.

The successful checks show that the current prototype builds and its core local review logic is functional. The failed or incomplete checks show that the release pipeline is not yet a reliable production gate.

## Recommended next work order

1. Decide the product promise: local personal tool versus synchronized service.
2. Decide and approve the dictionary provider, licensing, attribution, and quota model.
3. Write privacy, support, and data-retention requirements.
4. Remove demo behavior and fix onboarding/data-loss ambiguity.
5. Add lookup contract tests and repair the deterministic E2E test harness.
6. Harden and deploy the API with HTTPS, strict CORS, headers, observability, and provider monitoring.
7. Complete accessibility and keyboard/mobile testing.
8. Configure web/domain release metadata and, if applicable, native store identifiers and EAS delivery.
9. Run a staged beta and measure real lookup reliability before announcing the product publicly.

## Bottom line

The app is a promising, functional prototype with a solid visual foundation and a reasonable separation between screens, local data operations, and dictionary transport. It should be treated as **pre-production** today.

The shortest responsible path to launch is a tightly scoped web-first release with:

- one approved dictionary provider;
- a clearly stated local-storage model;
- real user statistics and reliable onboarding;
- a hosted HTTPS API with monitoring;
- legal/provider attribution;
- deterministic lookup and release tests; and
- accessible, recoverable user flows.

Once those foundations are stable, accounts/sync, richer dictionary content, reminders, and advanced learning features can be added without putting the first public release at risk.
