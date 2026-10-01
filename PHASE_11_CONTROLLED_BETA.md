# Phase 11 — Controlled beta release packet

Date: 2026-10-01

Status: Controlled beta packet complete and ready for manual sharing. No invitations or public announcements were sent.

## What this phase delivered

- Added CONTROLLED_BETA.md with a safe tester checklist and suggested invitation text.
- Documented the web-first, local-first scope and the absence of accounts or cloud synchronization.
- Added privacy-safe feedback instructions that exclude notes, backups, credentials, API keys, and metrics tokens.
- Included tester coverage for lookup, not-found behavior, saving, favourites, notes, review, export/import, responsive layouts, keyboard focus, Privacy, Support, refresh, Back, and Forward.
- Added owner gates for legal wording, real-device acceptance, monitoring, custom domain, and metrics operations.
- Added a Phase 11 regression check and CI step.

## Verification completed

- Phase 11 controlled beta checks passed.
- TypeScript typecheck passed.
- Git diff validation passed.
- Hosted monitor smoke passed for owl, apply, sesquipedalian, and a deterministic not-found word.
- The full 17-test browser acceptance suite passed in Phase 10.
- Live Privacy, Support, and owl lookup checks passed in Phase 10.

## Release details

- Hosted beta URL: https://my-dictionary-staging.onrender.com
- Beta packet commit: f96bd4d — Prepare controlled beta release packet
- Previous live application commit: 85b2f77
- The packet is prepared for invite-only use; it has not been sent to testers.

## How to use the packet

1. Choose a small tester group personally.
2. Share only the hosted URL and the invitation text in CONTROLLED_BETA.md.
3. Ask testers to follow the checklist and report only non-sensitive details.
4. Monitor GitHub Actions and the Support page.
5. Stop invitations and follow BETA_RUNBOOK.md if readiness failures, repeated 5xx responses, or data-loss reports appear.

## Important limitation

This does not constitute an unrestricted public launch. The remaining owner decisions are legal/provider wording approval, real-device and screen-reader acceptance, dedicated monitoring/custom-domain decisions, and an operator procedure for protected metrics.

## Decision point

Phase 11 is complete. Stop here until the owner confirms whether to begin the invite-only beta or continue with remaining launch sign-offs.
