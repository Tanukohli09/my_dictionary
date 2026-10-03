# Phase 13 — Google authentication foundation

Date: 2026-10-01

Status: Complete for the client authentication foundation. Google OAuth is implemented behind environment configuration, but it is not active on staging until a Supabase project and Google provider credentials are configured.

## What this phase delivered

- Added the Supabase JavaScript client.
- Added Expo AuthSession, WebBrowser, and SecureStore dependencies compatible with Expo SDK 57.
- Added a PKCE-based Supabase auth client in `src/services/auth.ts`.
- Added platform-aware session persistence: browser storage on web and SecureStore on native platforms.
- Added native and web callback handling for the `mydictionary://auth/callback` scheme and same-origin web callback.
- Added an `AuthProvider` that restores sessions, listens for auth changes, and exposes sign-in/sign-out state to the app.
- Added app foreground/background handling so native sessions refresh while the app is active and stop refreshing while it is backgrounded.
- Added an optional Account card to onboarding and Profile.
- Added a safe local-first fallback when Supabase variables are absent.
- Updated the in-app and repository privacy wording to disclose optional Google sign-in.
- Added a Phase 13 static configuration check.

## User behavior

When authentication is configured:

1. The user chooses **Continue with Google**.
2. Google completes OAuth through Supabase.
3. The app exchanges the callback code using PKCE.
4. The session persists securely on the device or browser.
5. Profile shows the signed-in account and provides **Sign out**.

When authentication is not configured, the app remains usable without an account and clearly explains that account access is not enabled in that build.

This phase does not upload saved words, notes, or review history. That is intentionally deferred to Phase 14 so authentication and data synchronization can be tested separately.

## Required external configuration

The implementation needs these values before real login can be tested:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` or the Supabase publishable client key
- Google provider enabled in Supabase Auth
- Authorized redirect URLs for the staging web origin, local web development, and the native app scheme
- Android OAuth client configuration for the final package ID and EAS signing certificate fingerprints

The Supabase service-role key, database password, OAuth client secret, and signing credentials must not be added to source control or an `EXPO_PUBLIC_*` variable.

## Known boundary

The hosted Render staging app will continue to show local-first account messaging until the deployment environment receives the Supabase public client variables and the provider configuration is completed. No account credentials were created or stored by this phase.

## Verification

```bash
npm run test:phase13
npm run typecheck
npm run build:web
```

The next phase is cloud data synchronization: define the Supabase schema and Row Level Security, migrate local words safely on first sign-in, and add retry/offline behavior.
