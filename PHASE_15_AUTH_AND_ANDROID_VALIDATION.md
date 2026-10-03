# Phase 15 — Authenticated testing and Android release validation

Date: 2026-10-02

Status: Complete for repository-side validation. Live Google authentication, two-account data-isolation testing, and a signed Android build remain external owner gates because this checkout does not have a configured Supabase project or EAS account.

## What this phase delivered

- Added `npm run test:phase15` to protect the Android package ID, deep-link scheme, Expo auth plugins, and EAS build profiles.
- Validated the resolved Expo configuration with `npx expo config --json`.
- Added a Playwright account-boundary test that runs without real credentials. It verifies that the Profile screen always exposes the account state and that local-first use remains available when Supabase variables are absent.
- Documented the manual two-account, offline retry, sign-out, and destructive-action checks needed before calling cloud sync production-ready.
- Documented the EAS development, internal preview, production, and Play Store submission path without creating an EAS project or signing credentials.
- Documented the remaining Android store asset gate. The app still needs an approved production icon/adaptive icon and Play listing artwork before publication.

## Repository verification completed

Run these commands from the repository root:

```bash
npm run test:phase15
npm run typecheck
npx expo config --json
```

The browser account contract is included in the normal suite:

```bash
npm run test:e2e
```

The test intentionally has two valid modes:

| Build mode | Expected account state | What it proves |
| --- | --- | --- |
| Supabase variables absent | `Local-first account access` | A release cannot lock users out when accounts are not configured. |
| Supabase variables present | `Continue with Google` | The configured build exposes the authentication entry point. |

This is a UI/configuration contract, not a substitute for a real OAuth session. Credentials are never committed to the test suite.

## Required live authentication test

Complete this after applying [`supabase/schema.sql`](supabase/schema.sql), configuring the public Supabase variables, enabling Google, and rebuilding the web bundle. Use two ordinary test Google accounts; do not use the owner's personal account as the only test account.

### Account isolation matrix

| Step | Account A | Account B | Expected result |
| --- | --- | --- | --- |
| 1 | Sign in | — | Account A is shown as signed in. |
| 2 | Search and save a unique word, favourite it, add a note, complete one review | — | The word, note, favourite, and review are local immediately and appear after sync. |
| 3 | Sign out | — | The account card returns to the signed-out state; no crash or data wipe occurs. |
| 4 | — | Sign in | Account B does not see Account A's saved word, note, favourite, or review. |
| 5 | Save a different word | — | Account B's data syncs independently. |
| 6 | Sign out and sign in again | — | Account B's own data returns; Account A's data remains absent. |
| 7 | Sign in on a second browser/device | — | The signed-in user's data converges after the first sync. |
| 8 | Turn off the network, edit/save/delete, then reconnect | — | Local actions remain available and retry; a reconnect does not resurrect a deleted word. |
| 9 | Clear all words and review history, reconnect, then sign in again | — | Cloud collections are cleared only for the active user. |

Record the date, build URL/commit, test-account aliases (not email addresses), and pass/fail result in the deployment runbook. Never record access tokens, passwords, service-role keys, or OAuth secrets.

## Android validation path

The repository configuration currently resolves to:

| Setting | Value |
| --- | --- |
| Android package | `com.tanukohli.mydictionary` |
| Native callback scheme | `mydictionary://auth/callback` |
| Initial Android version code | `1` |
| Development build | Internal development client |
| Preview build | Internal distribution, suitable for device testing |
| Production build | EAS-managed version increment, intended for Play AAB |

After the owner signs in to EAS, use the following sequence:

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile development
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

Install the preview APK on a physical Android device and verify search, save, notes, review, sign-out/sign-in, offline behavior, and the `mydictionary://` callback. Keep the development build separate from the production build. The production command should produce a signed Android App Bundle for Play Console.

Play submission is a separate owner-controlled step:

```bash
npx eas submit --platform android --profile production
```

Do not run that command until the Play Console app, listing, privacy declarations, content rating, data-safety answers, support URL, screenshots, icon, and signed release policy are complete. EAS/Play credentials must stay in their supported account or secret stores, never in this repository.

## OAuth configuration clarification

The current client uses Supabase's browser-based OAuth flow with a PKCE callback. It needs a Google provider configured in Supabase and the redirect URLs in [`supabase/README.md`](supabase/README.md). An Android-specific Google SDK client is not used by this implementation; do not add one unless the authentication architecture is intentionally changed to native Google Sign-In. The Android package ID and EAS signing identity still matter for the Android release and for any future native provider integration.

## Remaining gates

| Gate | Owner | Status |
| --- | --- | --- |
| Apply Supabase schema and enable RLS | App owner | Pending external setup |
| Configure Supabase public variables in Render and Android/web build environments | App owner | Pending external setup |
| Enable Google provider and register redirects | App owner | Pending external setup |
| Complete two-account isolation and offline retry matrix | App owner/tester | Pending live accounts |
| Create/link EAS project and generate signing credentials | App owner | Pending EAS account |
| Build and install Android preview APK | App owner/tester | Pending EAS build |
| Approve icon, adaptive icon, screenshots, listing, and Play policy declarations | App owner | Pending product/store assets |
| Submit to Play Console closed testing | App owner | Pending all gates above |

Phase 15 is complete for the code and documentation that can be safely prepared locally. The app should not yet be called cloud-ready or Play-ready until the pending gates are recorded as passed.
