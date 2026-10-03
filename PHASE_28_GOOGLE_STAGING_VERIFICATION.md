# Phase 28 — Google sign-in on staging

Updated: October 3, 2026 (Asia/Kolkata)

## Completed

- The owner entered the newly created Google OAuth client secret directly into Supabase. Supabase Authentication now shows the Google provider as **Enabled**. The secret was not placed in source control, logs, or this report.
- Google OAuth branding now has the staging home page, the deployed privacy page, and the authorized staging domain. The Google app remains in **Testing** mode; this is not a public OAuth launch.
- Enabled `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED` for the existing Render staging Blueprint. Render's Docker build needed explicit `ARG` declarations for the three public web-build values; added those without adding a server-side secret.
- Changed the web OAuth path to Supabase's same-tab redirect. Native Android/iOS still use the existing Expo auth-session flow.
- Pushed `69c8892`, `b83461e`, and `b4c100f`. Render reports `b4c100f` **Live**.
- On the live Profile page, the Google sign-in control appeared, and a signed-in Google account was visible. The cloud-sync indicator settled to its normal online state. A read-only database count showed one auth user and three synchronized word entries. This verifies a real account and a basic cloud-write path, not multi-account isolation.
- `npm run test:all` passed after each code correction: TypeScript, web export, Node/phase checks, and all 21 Playwright browser tests. Hosted `beta:smoke` passed for `owl`, `apply`, `sesquipedalian`, and a not-found word.

## Not yet verified or ready for public launch

- Two-account isolation, sign-out/re-sign-in recovery, offline conflict recovery, and account deletion have not been exercised against live accounts. No account or user data was deleted.
- The Android-only `gpt-6-luna` max-effort subagent generated a native project in a temporary copy, but could not build or install: Java, Android SDK, and ADB are absent. No APK was produced and no phone data was touched. Android SDK license acceptance and a free toolchain are needed before that device phase can continue.
- The latest dependency audit recorded in `DEPENDENCY_REMEDIATION.md` has 16 high dependency-chain findings through `node-forge` and `braces`, with no patched versions listed at audit time. This is a separate security release gate.
- Google OAuth remains limited to test users. Public OAuth publication, Play Store listing, data-safety declarations, required testing, and launch monitoring still require separate approval and verification.

This phase completes staging Google sign-in activation and a one-account smoke check, not production or Play Store readiness.
