# Phase 18 — Account deletion and data lifecycle

Date: 2026-10-02

Status: Complete for repository-side implementation. The account-deletion Edge Function must still be deployed to the owner's Supabase project and verified with a dedicated test account before this capability is enabled for real users.

## What this phase delivered

- Added a confirmed **Delete account** action to the signed-in Account card.
- Added `deleteAuthenticatedAccount()` to invoke the server-side `delete-account` Edge Function and clear the current auth session locally.
- Added local cleanup for the deleted user's scoped words, review history, tombstones, and cloud-clear markers.
- Added a Supabase Edge Function that authenticates the caller's bearer token and uses the server-only Admin API to delete that user.
- Kept the Supabase service-role key exclusively inside the Edge Function runtime; it is never referenced by the Expo client.
- Confirmed the existing database foreign keys cascade deletion to profiles, saved words, and review submissions.
- Added a credential-free test for local deletion cleanup and account-deletion wiring.
- Updated the privacy notice, support instructions, and Supabase runbook.

## User behavior

For a signed-in user:

1. Profile shows **Delete account** below **Sign out**.
2. The app asks for explicit confirmation and recommends exporting a backup first.
3. The app calls the authenticated Edge Function.
4. The function validates the session and deletes the Supabase Auth user through the Admin API.
5. Database cascade rules remove the user's profile, words, and review history.
6. The app removes that user's local cache, then performs a local-only sign-out and returns to the signed-out state.

If the Edge Function is missing, unavailable, or fails, the app keeps the account and local data intact and shows an error. It never reports success after a failed server deletion.

## Deploy the server function

From a trusted machine with the Supabase CLI linked to the correct project:

```bash
supabase functions deploy delete-account
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` to Render, Expo, `.env` files committed to Git, or any `EXPO_PUBLIC_*` variable. Supabase injects the function's server environment automatically. The function is intentionally not deployed by this local phase.

## Verification required before enabling accounts

Use a dedicated test account, not the owner's personal account:

- Sign in and save a unique word, note, favourite, and review.
- Export a backup if needed, then confirm **Delete account**.
- Verify the app returns to signed out and the local data is gone.
- Verify the user cannot sign in again with the deleted Google account.
- Verify `profiles`, `word_entries`, and `review_submissions` contain no rows for that user.
- Verify a different test account cannot see the deleted user's data.
- Verify a failed/unavailable function leaves the account and local data intact.

Run the repository checks before and after deployment:

```bash
npm run test:phase18
npm run typecheck
npm run test:e2e
```

## Remaining external gates

- Apply the Supabase schema and deploy `delete-account`.
- Configure Supabase public variables and Google OAuth.
- Complete the two-account isolation/offline matrix from Phase 15.
- Run the deletion verification above in staging.
- Review final privacy/data-retention wording with the owner's legal requirements.
- Build and test the Android preview before Play closed testing.

Phase 18 is complete for local code and documentation. Account deletion is not production-enabled until the deployed function and staging verification pass.
