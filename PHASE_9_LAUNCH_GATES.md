# Phase 9 — Launch gates and free hosted monitoring

Date: 2026-10-01

Status: Phase complete. The repository-side monitor and GitHub security gate are enabled; the remaining items are optional or owner-review launch decisions.

## What this phase delivered

### Free hosted-service monitoring

- Added .github/workflows/production-monitor.yml.
- GitHub Actions runs the read-only beta smoke contract every 15 minutes.
- The workflow also supports a manual run from the GitHub Actions tab.
- The monitor checks health, readiness, security headers, CORS, provider approval, representative lookups, request IDs, and a deterministic not-found response.
- No metrics token or other secret is used by the monitor.

### Render cold-start tolerance

- Added scripts/hosted-monitor.js.
- The monitor retries the complete smoke contract up to three times when a free-tier cold start causes a transient failure.
- The retry delay is configurable through MONITOR_RETRY_DELAY_MS.
- The attempt count is configurable through MONITOR_ATTEMPTS.

### Documentation and regression protection

- Updated the README with the monitor's purpose and limitations.
- Updated BETA_RUNBOOK.md with monitoring, cold-start, and incident guidance.
- Added Phase 9 static checks and a required CI step.
- Kept the monitor read-only: it does not change saved words, account data, provider settings, or metrics.

## Verification completed

Passed in the clean publish clone:

- TypeScript typecheck
- Phase 1 verification
- Phase 3 verification
- Phase 8 resilience checks
- Phase 9 launch-gate checks
- Review checks
- Server hardening checks
- Production web build and release smoke

Live verification:

- Render service: my-dictionary-staging
- Render live commit: 85b2f77
- Hosted service monitor manual run: GitHub Actions run 36879377203
- Monitor result: Success
- Live provider: Datamuse

During the first direct check, Render returned a transient 503 while the free service was waking. A subsequent check returned 200 for both /health and /ready. The retry-enabled monitor then passed successfully, which is the expected behavior for this hosting tier.

## Remaining launch gates

1. The GitHub Actions monitor is a free baseline, not an SLA-grade uptime service. A dedicated uptime provider and alert destination remain recommended before high-traffic or business-critical use.
2. The protected /metrics endpoint still needs an operator-owned token-handling and alerting procedure.
3. Real-device acceptance remains: mobile browser, desktop browser, keyboard-only navigation, screen reader basics, slow network, and a fresh browser profile.
4. Privacy, provider attribution, and support wording still need final owner/legal approval.
5. A custom domain remains optional and requires DNS configuration.
6. Native identifiers and store work remain out of scope unless native distribution is approved.

## Published change

- Commit: 85b2f77 — Add free hosted service monitoring
- Render is Live on this commit.
- The Phase 9 report is this file.

## Decision point

Phase 9 is complete. Stop here until the owner confirms whether to begin the next phase.
