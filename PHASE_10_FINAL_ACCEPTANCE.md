# Phase 10 — Final user acceptance

Date: 2026-10-01

Status: Automated and hosted acceptance complete. Final owner/legal and real-device sign-off remain before an unrestricted public announcement.

## What this phase delivered

### User-facing security guidance

- Updated SECURITY.md to reflect that GitHub private vulnerability reporting is enabled.
- Updated SUPPORT.md to direct security reports to the private GitHub security channel.
- Added a Phase 10 regression check so the guidance cannot silently drift back to the pre-launch wording.

### Final acceptance coverage

- Re-ran the full Playwright suite across mobile, desktop, lookup, fallback, timeout, retry, navigation, notes, review, profile, accessibility, and legal/support flows.
- Verified the live Privacy page before onboarding.
- Verified the live Support page and its safe reporting guidance.
- Performed a real live lookup for owl and verified a Datamuse definition at the shareable result URL.

## Verification completed

Passed in the clean publish clone:

- Full Playwright suite: 17 tests passed
- TypeScript typecheck
- Phase 1, Phase 3, Phase 8, Phase 9, and Phase 10 checks
- Review checks
- Server hardening checks
- Production web build and release smoke
- Hosted monitor smoke with Render cold-start retry

Live acceptance:

- Privacy route rendered at /?screen=privacy.
- Support route rendered at /?screen=support.
- Search for owl returned /?screen=result&word=owl.
- Live result showed a definition and Datamuse as the source.
- GitHub private vulnerability reporting showed as enabled.

## Current launch assessment

The web-first local-first beta is operationally ready for a controlled release:

- real dictionary lookup and fallback paths are tested;
- hosted HTTPS service, CORS, security headers, health, readiness, and monitoring are active;
- saved data behavior is local and documented;
- refresh, Back, Forward, and shareable saved-word routes are covered;
- Privacy, Support, and Security guidance are reachable and consistent;
- the full browser acceptance suite is green.

## Remaining owner sign-offs

1. Review and approve the provider attribution, privacy notice, and support wording for the intended audience.
2. Perform real-device checks on at least one mobile browser and one desktop browser, including keyboard-only and basic screen-reader use.
3. Decide whether the free GitHub Actions monitor is sufficient for launch or whether a dedicated uptime provider and alert recipient are needed.
4. Decide whether to configure a custom domain before inviting users.
5. Define an operator procedure for the protected /metrics endpoint if metrics will be used for incident response.
6. Keep native app identifiers and store work out of scope unless native distribution is approved.

## Published change

- Final acceptance implementation commit: 2c880c8 — Finalize launch acceptance guidance
- The previous live application commit is 85b2f77.
- The Phase 10 report is this file.

## Decision point

Phase 10 implementation and automated acceptance are complete. Stop here until the owner confirms whether to proceed to the controlled beta/public launch decision.
