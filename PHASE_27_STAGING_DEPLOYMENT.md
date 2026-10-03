# Phase 27 — recovered release on staging

Updated: October 3, 2026 (Asia/Kolkata)

## Completed

- Pushed recovered account, cloud-sync, accessibility, resilience, and Android-preparation work to `main` as `e215b90`.
- Added an explicit `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED` release gate. Google sign-in stays hidden unless the flag is `true` and the public Supabase URL/key are available at build time.
- Render's first build exposed a Node engine mismatch: Supabase JS 2.117.2 requires Node 22+, while the Docker image used Node 20. Updated both Docker stages and package engine metadata to Node 22; pushed the correction as `eec1744`.
- Render auto-deployed `eec1744` to the existing free `my-dictionary-staging` service and reported **Deploy succeeded | Live**.
- `npm run test:all` passed after the release-gate change and again after the Node correction: TypeScript, web export, Node suites, release smoke, server hardening, and all 21 Playwright browser tests.
- Hosted `beta:smoke` passed at `https://my-dictionary-staging.onrender.com` for `owl`, `apply`, `sesquipedalian`, and a not-found word. The hosted Profile screen displayed local-first account access; the Google button was not offered while the provider remains disabled.
- `.env.local` and `dist/` were ignored and not committed. The staged source was checked for Google OAuth and Supabase service-role secret patterns before the push.

## Not completed by this phase

- Google login is **not** live. Supabase's Google provider remains disabled until the owner directly transfers the Google client secret to Supabase and saves the provider settings. The app's release flag must then be enabled in Render and a new build verified.
- Google OAuth is still in Testing mode with only the owner as a test user. Public OAuth branding, domain/verification requirements, and production publishing remain separate launch gates.
- Real two-account cloud sync, sign-out, offline recovery, and deletion have not been validated against live accounts. No real account or user data was deleted.
- A fresh advisory audit now reports 16 high dependency-chain entries through `node-forge` and `braces`; see `DEPENDENCY_REMEDIATION.md`. Android/Play Store gates remain pending. The connected phone was not touched; device build/install/testing is reserved for a `gpt-6-luna` subagent at max effort.

This phase completes the staging code deployment, not public launch readiness.
