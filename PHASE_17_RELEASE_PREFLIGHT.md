# Phase 17 — Release preflight and CI enforcement

Date: 2026-10-02

Status: Complete for repository-side release enforcement. The preflight cannot create or verify external Supabase, Google, EAS, Render, or Play Console resources; those remain owner-controlled gates.

## What this phase delivered

- Added `npm run release:preflight` for a safe local configuration check.
- Added strict mode for a production release: `npm run release:preflight -- --strict`.
- Strict mode rejects incomplete Supabase configuration, private/service-role-looking keys, offline dictionary fallback, unapproved providers, wildcard production CORS, and non-HTTPS production origins.
- Local mode remains usable without Supabase and reports the missing account configuration as a warning rather than blocking development.
- Made Render's production `EXPO_PUBLIC_OFFLINE_FALLBACK=false` setting explicit.
- Added `npm run test:phase17` with valid, incomplete, and unsafe configuration cases; tests use fake values only and never contact Supabase.
- Added Phases 12–17 to the GitHub quality workflow so account, sync, storage-isolation, and release-preflight checks run on every push and pull request.
- Added this report with the exact release order and owner gates.

## Preflight modes

| Mode | Command | Purpose |
| --- | --- | --- |
| Local | `npm run release:preflight` | Allows local-first development and warns when Supabase is absent. |
| Strict release | `npm run release:preflight -- --strict` | Fails unless the production account/provider/CORS settings are complete. |

The script never prints client keys or secret values. It only reports which category is missing or unsafe.

## Required strict release environment

Before a production web or Android build is approved, provide these through the hosting/EAS environment—not source control:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<public-anonymous-or-publishable-key>
EXPO_PUBLIC_OFFLINE_FALLBACK=false
DICTIONARY_PROVIDER_APPROVED=true
DICTIONARY_ALLOWED_ORIGIN=https://<final-https-origin>
NODE_ENV=production
DICTIONARY_ENV=production
```

Never use a Supabase service-role key, database password, Google client secret, EAS token, or Play service-account key in an `EXPO_PUBLIC_*` variable or in the repository.

## Recommended deployment order

1. Apply [`supabase/schema.sql`](supabase/schema.sql) and confirm Row Level Security is enabled.
2. Configure the Supabase public URL/key in Render and the EAS build environment.
3. Enable Google in Supabase Auth and register the redirects in [`supabase/README.md`](supabase/README.md).
4. Run `npm run release:preflight -- --strict` with the production environment values.
5. Build the web bundle and deploy staging.
6. Run the existing hosted smoke contract against `/health`, `/ready`, real lookups, CORS, and security headers.
7. Run the Phase 15 two-account isolation/offline matrix against the configured staging URL.
8. Build and install the EAS Android preview APK; verify OAuth callback, icon, account switching, and offline behavior on a physical device.
9. Only after those checks pass, create the production AAB and start Play Console closed testing.

## What is still not proven by this phase

- A public Supabase project has not been configured in this checkout.
- Google OAuth has not completed with real accounts.
- Render has not been rebuilt with Supabase public variables.
- EAS has not produced a signed Android artifact.
- Play Console listing, policy, data-safety, content-rating, and closed-test requirements remain pending.

Phase 17 is complete for local enforcement and CI coverage. A deployment is not release-approved merely because the local preflight passes; the live service and two-account tests must also pass.
