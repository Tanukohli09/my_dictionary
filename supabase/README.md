# Supabase setup for My Dictionary

The database and synchronization client are implemented. The staging database was created on October 3, 2026; Google provider configuration and live account testing are tracked in `../SUPABASE_STAGING_STATUS.md`.

## Apply the schema

1. Create or open the Supabase project for My Dictionary.
2. Open **SQL Editor**.
3. Run [`schema.sql`](schema.sql) once.
4. Confirm that `profiles`, `word_entries`, and `review_submissions` exist and that Row Level Security is enabled on all three tables.

The schema is safe to rerun: it uses `if not exists`, recreates the policies, and replaces the new-user profile trigger. For a new project, keep the Data API enabled, disable automatic exposure of new tables, and enable automatic RLS. The schema grants only the required tables to `authenticated`; it denies table access to `anon` and keeps the profile trigger outside the exposed `public` schema.

## Configure the client

Set these variables in local `.env.local` and in the Render service environment:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<public-anon-or-publishable-key>
```

Expo embeds `EXPO_PUBLIC_*` values into the client bundle. The anonymous/publishable key is intended for that use only after Row Level Security is enabled. Never use the Supabase service-role key here.

## Deploy account deletion

The signed-in Profile card includes a destructive **Delete account** action. It invokes the [`delete-account`](functions/delete-account/index.ts) Edge Function, which validates the caller's session and deletes the authenticated user through the server-side Supabase Admin API. The database foreign keys remove the user's profile, word entries, and review submissions through `on delete cascade`.

Deploy the function from a trusted environment after linking the intended Supabase project:

```bash
supabase functions deploy delete-account
```

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to the function runtime. Do not copy the service-role key into the app, Render public variables, an `EXPO_PUBLIC_*` variable, or this repository. If the function has not been deployed, the app keeps the account and local data intact and shows a retry/support error instead of pretending deletion succeeded.

## Configure Google redirects

Enable Google under **Authentication → Providers** and register these redirect URLs in Supabase Auth:

- `http://localhost:8081/auth/callback`
- `https://my-dictionary-staging.onrender.com/auth/callback`
- `mydictionary://auth/callback`

The Google OAuth client also needs the matching web origin and the Android package `com.tanukohli.mydictionary` with the EAS signing certificate fingerprints when the native build is created.

## Sync behavior

- Local storage remains the immediate offline source of truth.
- Sign-in merges local and cloud words by `normalized_word`.
- The newer `updated_at` entry wins; existing cloud IDs are retained for merged words.
- Review submissions merge by submission ID.
- Local deletes create user-scoped tombstones so deleted words are not resurrected offline.
- Clear-all actions create retryable cloud-delete markers.
- A sync failure never discards the local wordbook; the next sign-in, mutation, or app refresh retries it.

## Verification after configuration

After setting the variables and applying the schema, test:

1. New Google sign-in creates one profile row.
2. Saved words and review history appear only for the signed-in user.
3. Sign out leaves local data available but stops cloud writes.
4. A second device receives the merged wordbook after sign-in.
5. Offline edits sync after connectivity returns.
6. Clearing data removes the cloud copy after connectivity returns.
7. Delete account with a dedicated test account and confirm that the user can no longer sign in, the three user-scoped tables are empty, and the device cache is gone.
