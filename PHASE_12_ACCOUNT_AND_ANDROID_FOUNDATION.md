# Phase 12 — Account and Android release foundation

Date: 2026-10-01

Status: Complete. This phase records the approved architecture and prepares the repository for account authentication and Android release work. It does not connect a live Supabase project, create Google OAuth credentials, publish an Android build, or change the hosted staging service.

## Decisions made

- Authentication provider: Supabase Auth.
- User-data database: Supabase Postgres.
- Identity provider: Google OAuth.
- Android application ID: `com.tanukohli.mydictionary`.
- Native app URL scheme: `mydictionary`.
- Android build path: Expo Application Services (EAS), with development, internal preview, and production profiles.
- Existing local-first storage remains the offline cache and migration source until Phase 14 cloud sync is implemented.

Google login does not need separate Google “signup” and “login” implementations. The first successful Google sign-in creates the app account; later sign-ins resolve to the same account.

## Repository changes

- Added the final Android package ID and initial `versionCode` to `app.json`.
- Added the `mydictionary://` deep-link scheme for native OAuth callbacks.
- Added `eas.json` with development, internal preview, and production build profiles.
- Documented the future Supabase client variables in `.env.example`.
- Added `npm run test:phase12` to protect the foundation configuration.

## Planned account architecture

The client will use the Supabase public client URL and anonymous/publishable key. The Supabase service-role key must never be shipped to Expo or placed in an `EXPO_PUBLIC_*` variable.

The planned data boundary is:

| Area | Planned owner | Notes |
| --- | --- | --- |
| Google identity and session | Supabase Auth | OAuth provider handles identity; the app handles session state and sign-out. |
| User profile | `profiles` table | One row per authenticated user, keyed by Supabase user ID. |
| Saved dictionary entries | `word_entries` table | Every row is scoped to `user_id`; `normalized_word` supports idempotent merges. |
| Review history | `review_submissions` table | Every row is scoped to `user_id`; history is append-oriented. |
| Offline behavior | AsyncStorage | Local cache remains usable when the network is unavailable. |
| Authorization | Postgres Row Level Security | Users may read and write only their own rows. |

The first signed-in session will offer a controlled local-data migration. Words will merge by `normalized_word`; review history will deduplicate by submission ID; newer `updated_at` values will win for editable word fields. The migration must be retryable and must not clear local data until the cloud write has been confirmed.

## Required configuration in the next implementation phase

The following values are intentionally not present yet:

1. Supabase project URL.
2. Supabase anonymous/publishable client key.
3. Google OAuth web client ID and authorized redirect URI.
4. Android OAuth client ID and the signing certificate fingerprints for the EAS build.
5. A decision on whether the staging web origin is also the first OAuth redirect origin.

These values belong in deployment/account settings, not in source control. The service-role key, database password, signing credentials, and any private OAuth secret must remain server-side or in EAS/hosting secret storage.

## Android release foundation

The package ID is now treated as permanent because changing it after publication creates a different Play Store application. `versionCode` starts at `1`; production EAS builds will auto-increment it after the EAS project is linked.

The repository is ready for the next Android steps, but it is not yet a Play Store submission:

- No signed Android App Bundle has been built.
- No Play Console application has been created.
- Store listing assets and policy forms are not complete.
- Real-device Google authentication has not been tested.
- The Play closed-test requirement has not been started.

## Out of scope for Phase 12

- Creating accounts on Supabase, Google Cloud, EAS, or Google Play Console.
- Asking for or storing user credentials in the repository.
- Implementing login UI or cloud synchronization.
- Moving existing local data to the cloud.
- Sending beta invitations or publishing the Android app.

## Verification

Run:

```bash
npm run test:phase12
npm run typecheck
```

Phase 13 can begin once the owner has a Supabase project and is ready to configure Google OAuth. The implementation will then add the auth client, session boundary, login UI, and callback handling.
