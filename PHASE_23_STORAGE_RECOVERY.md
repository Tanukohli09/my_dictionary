# Phase 23 — Local storage integrity and recovery

Date: 2026-10-02

Status: Complete for repository-side implementation. Existing devices should still be tested with real backups before a public release.

## What this phase delivered

- Added validation for persisted word and review collections before the app uses them.
- Detects malformed JSON, non-array storage shapes, and invalid collection entries instead of treating them as silently healthy data.
- Preserves the original raw value in a user-scoped recovery copy when corruption is detected; the original storage value is never deleted automatically.
- Keeps valid entries usable when only part of a collection is invalid.
- Exposes storage health to the app and clears the warning only after a successful replacement write.
- Added an accessible recovery notice that directs users to Profile, where they can import a My Dictionary backup or clear the affected data intentionally.
- Resets in-memory storage warnings when the authenticated user changes so one account’s warning is not shown to another account.
- Added credential-free corruption, partial-entry, recovery-copy, repair, and CI regression checks.

## User behavior

- A healthy existing wordbook behaves exactly as before.
- If local data cannot be parsed, the app does not claim that the user simply has an empty dictionary.
- Usable entries remain available when a damaged collection contains a mixture of valid and invalid records.
- The app shows a clear recovery banner with a direct path to Profile/import.
- Importing a valid backup, clearing the collection, or successfully writing repaired data removes the active warning.
- Recovery copies are scoped by signed-in user and are kept locally; they are not uploaded or included in support diagnostics.

## Verification

```bash
npm run test:phase23
npm run typecheck
npm run test:e2e
```

The Phase 23 check uses an in-memory AsyncStorage implementation to prove the failure and repair paths without credentials or network access. The existing 19-test browser suite protects the visible app flows.

## Remaining release gate

This is a recovery safety net, not a substitute for backup testing. Before launch, test upgrade scenarios from the previous app version, restore a real exported backup on a second device, and confirm the final privacy/retention wording for local recovery data.

Phase 23 is complete for local implementation and automated regression coverage.
