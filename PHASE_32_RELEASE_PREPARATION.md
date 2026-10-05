# Phase 32 — Play release preparation and current gates

Updated: October 6, 2026 (Asia/Kolkata)

## Completed

- Reconciled the local `main` branch with the five privacy/account-deletion commits on `origin/main`. No existing working-tree edits were discarded. The application and release preparation were pushed as `c4f59ce` after merge `8d0296c`; the Handoff update was pushed as `1bc5f03`.
- Ran `npm run test:all` with loopback access enabled. TypeScript, the production web export, all 25 script suites, and all 25 Playwright tests passed. The first run under the default sandbox could not bind local servers (`EPERM`); the full rerun with loopback permission passed.
- Ran `npm run release:preflight -- --strict --native` using the configured production public Supabase values and the approved hosted dictionary endpoint. It passed. This checks configuration shape only; it does not prove an interactive Google sign-in, cloud sync, or account-deletion flow.
- Inspected the production EAS source archive without starting a build. The generated archive excluded `.env.local` and `.env`: `.gitignore` excludes `.env.*`, and this checkout has no `.easignore` that would replace those rules. The production profile selects EAS's `production` environment. For local Expo preview/export commands, `EXPO_NO_DOTENV=1` prevents staging values from a local env file being bundled. See [Expo EAS ignore rules](https://docs.expo.dev/build-reference/easignore/) and [EAS environment-variable FAQ](https://docs.expo.dev/eas/environment-variables/faq/).
- A local preview using the explicit production configuration verified the custom-scheme callback routing. The earlier staging `.env.local` values were avoided by starting Expo with `EXPO_NO_DOTENV=1`; this is a local preview fix, not a code change.
- Pushed to GitHub `main`. Soon after the push, the public Render `/health` endpoint returned 200, `ok: true`, provider `datamuse`, fallback `wiktionary`, and `providerApproved: true`.
- Repeated the hosted monitor after the push against the existing free Render service. It passed health/readiness, CORS, web security headers, `owl`, `apply`, `sesquipedalian`, and `zzzzzzzzzz` not-found behavior.
- Kept hosting on the configured free tiers. No paid service or plan was created.
- Added the app icon, feature graphic, and two phone screenshots under `play-store-assets/`; Play Console's listing assets were previously saved as a draft.
- Play Console work saved the corrected Data Safety answers without Diagnostics or Device IDs, verified the app as Free, saved ages 13–15, 16–17, and 18+ as the target audience, and targeted Alpha India. The English (UK) listing and its assets are saved; the draft closed-test track is named “Initial closed test.” No AAB, testers, or track submission exists yet.

## Release blockers

- **Google rejects the production OAuth client pair.** Supabase Auth recorded callback HTTP 500, `Unable to exchange external code`, and provider detail `invalid_client` / client-secret error on both attempts. The copied production secret matches the staging secret, its suffix matches the active Cloud credential, and no surrounding whitespace was found, yet Google still rejects it. Owner action: create/obtain a fresh active Google OAuth client secret and save it in production Supabase, then retry with the production-configured preview. The callback `http://localhost:8092/auth/callback` is temporarily allowlisted for the pending test and must be removed afterward. No successful production sign-in, two-account data isolation, sign-out/re-sign-in, offline recovery, or test-account deletion has been verified. A preexisting session remained intact and no new account was created. Do not test by deleting the owner's account or data.
- **Dependency security gate remains open.** The online `npm audit --json` on October 5 reported 16 high, 0 moderate, and 0 critical findings. The lock tree contains `node-forge@1.4.0` under Expo signing tooling and `braces@3.0.3` under Metro. The reviewed advisories list no released fixes; npm's suggested fix downgrades Expo to 44.0.6 and React Native to 0.72.17, incompatible major downgrades that were not applied. No speculative patch or suppression was added. See `DEPENDENCY_REMEDIATION.md`.
- **No corrected production Android App Bundle exists yet.** The earlier EAS build `d6e9abbf-5ef0-4446-8b7c-4ba9ebf9cbb2` predated the account-deletion wording correction and was cancelled. Per `Handoff.md`, create a new production AAB only after live acceptance and the security gate are resolved. The EAS production profile is configured and the Expo account remains on the $0 plan.
- **Google Play's closed-test gate still applies.** The owner will arrange at least 12 real testers and enter their emails in Play Console. Each must join the closed test and stay opted in for 14 continuous days before the account can request production access. Do not fabricate testers or claim public publication before Google's production review.

## Next

1. Complete production account acceptance with dedicated non-owner test accounts, or document the exact callback/test limitation if it cannot pass.
2. Wait for vendor-published dependency fixes or evaluate a supported Expo toolchain update; then run a fresh audit and compatibility/signing checks.
3. Build and verify the corrected production-signed AAB only after those gates pass. Upload it to the closed test track, then let the owner enroll the 12 testers.
4. Request production access after the required 14-day test and finish Google's review and release flow.
