# Phase 14 — Cloud data synchronization

Date: 2026-10-02

Status: Complete for the schema and client sync implementation. Live cloud synchronization remains inactive in the current staging deployment until the owner applies the Supabase schema and supplies the public client configuration.

## What this phase delivered

- Added `supabase/schema.sql` for profiles, saved word entries, and review submissions.
- Enabled Row Level Security with user-scoped read, insert, update, and delete policies.
- Added a new-user profile trigger that stores only display name and email metadata.
- Added `src/services/cloudSync.ts` for initial merge, uploads, retryable deletes, and sync status.
- Connected local word saves, favourites, notes, review submissions, imports, and deletes to the sync queue.
- Added user-scoped word deletion tombstones so offline deletes are not undone by the next cloud pull.
- Added clear-all markers for words and review history so destructive local actions can be replayed to the cloud after reconnecting.
- Added an initial sync after a session is restored or a user signs in.
- Added local-first sync status messaging to the Account card.
- Added Render build-time environment placeholders for the Supabase public client values.
- Added [`supabase/README.md`](supabase/README.md) with setup, redirect, security, and verification instructions.

## Merge and conflict rules

| Data | Identity | Merge rule |
| --- | --- | --- |
| Word entries | `user_id + normalized_word` | Newer `updated_at` wins; existing cloud ID is retained. |
| Review submissions | `user_id + id` | Same ID is deduplicated; local submission wins for equal IDs. |
| Deleted words | `user_id + normalized_word` tombstone | Cloud row is deleted before the next merge. |
| Clear-all actions | user-scoped pending marker | All rows in that collection are deleted before current local rows are uploaded. |

## Security boundary

- The client sends the Supabase public anonymous/publishable key and the authenticated user session.
- Row Level Security checks `auth.uid() = user_id` for every user-owned table operation.
- The service-role key, database password, and OAuth client secret are never used by the app.
- The local wordbook remains available when the network or Supabase is unavailable.
- A sync failure does not replace local data with an empty result.

## External setup still required

1. Run `supabase/schema.sql` in the correct Supabase project.
2. Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in local and Render build environments.
3. Enable Google in Supabase Auth and register the web/native redirect URLs listed in `supabase/README.md`.
4. Rebuild the web bundle and later the Android development build; Expo public variables are embedded at build time.
5. Test two separate accounts to confirm Row Level Security and data isolation.

## Verification

```bash
npm run test:phase14
npm run typecheck
npm run build:web
```

The next phase is authenticated end-to-end testing and Android build validation after the external configuration exists. Do not call the app cloud-ready until two-account isolation and offline retry have been tested.
