# Phase 21 — Real empty states and word-of-the-day behavior

Date: 2026-10-02

Status: Complete for repository-side implementation. The remaining production gates are still external provider, hosting, account, EAS, Play Console, and policy verification.

## What this phase delivered

- Removed the hard-coded **Ephemeral** demo word from the Search screen.
- Replaced the misleading empty-state card with **Your first word is waiting**.
- Made the daily card use a deterministic entry from the user’s actual saved wordbook, sorted by normalized word for stable cross-device selection.
- Added a browser regression test proving a clean user does not see demo word content.
- Added a credential-free Phase 21 check and CI enforcement.

## User behavior

- A new user sees a clear invitation to search and save their first word.
- A user with saved words sees one real saved entry selected for the current day.
- Recently added remains empty until the user has actually searched and saved a word.
- Profile totals, review counts, favourites, and streaks continue to derive from real local or synchronized data.

The card is intentionally described as **Your word of the day** because it is selected from the user’s own wordbook. It does not claim to be a globally curated or provider-supplied word-of-the-day feed.

## Verification

```bash
npm run test:phase21
npm run typecheck
npm run test:e2e
```

The lookup E2E suite now covers the clean-wordbook state, and the static check protects the repository from reintroducing a hard-coded demo entry.

## Remaining external gates

- If a globally curated word-of-the-day feature is wanted later, select a real source and document its license, attribution, freshness, and failure behavior.
- Complete staging provider/account tests and the Android preview/Play Store gates from Phases 17–20.
- Review the final empty-state copy during real-device accessibility and localization checks.

Phase 21 is complete for local product correctness and automated coverage.
