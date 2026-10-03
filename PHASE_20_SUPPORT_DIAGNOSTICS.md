# Phase 20 — Privacy-safe support diagnostics

Date: 2026-10-02

Status: Complete for repository-side implementation. A signed Android build and external support workflow still require the owner-controlled EAS, Play Console, hosting, and issue-triage setup.

## What this phase delivered

- Added a privacy-safe diagnostics report for the Support screen.
- Captures the app platform/runtime, cloud-sync status, latest dictionary provider, response status, latency, outcome, and server request ID when available.
- Adds request-ID capture to the dictionary client so a hosted lookup failure can be traced in server logs.
- Supports copying diagnostics on the web and sharing them through the native share sheet.
- Explicitly excludes saved words, personal notes, backup contents, access tokens, email addresses, and account IDs.
- Added an accessible Support-screen action and a browser regression check.
- Added a credential-free Phase 20 wiring check and CI enforcement.

## User flow

1. A user opens Support after a lookup or account problem.
2. They select **Copy technical diagnostics** when support asks for it.
3. The web app copies the report; native builds open the platform share sheet.
4. The user attaches the report to a private support channel or issue only after reviewing it.

The report is a troubleshooting aid, not an analytics system. It stays in memory until the user chooses to copy/share it and is not uploaded automatically.

## Safety contract

The diagnostics payload may contain operational identifiers and timing data, but it must not contain:

- searched words or dictionary definitions;
- saved words, personal meanings, notes, review answers, or backup data;
- Google/Supabase access tokens, provider keys, or service-role keys;
- email addresses, user IDs, or authentication claims.

Support instructions continue to tell users not to publish private notes, backups, credentials, or tokens in public issues.

## Verification

```bash
npm run test:phase20
npm run typecheck
npm run test:e2e
```

The browser regression verifies that the Support page exposes the accessible diagnostics action. The static Phase 20 check verifies request-ID capture, privacy wording, cloud-sync wiring, and CI coverage.

## Remaining external gates

- Confirm the final private support channel and who triages reports.
- Review diagnostics wording and retention with the owner’s privacy requirements.
- Deploy the configured server and confirm its request IDs appear in protected logs.
- Build the Android preview and verify the native share sheet on a physical device.
- Complete the EAS, Google OAuth, Supabase deletion, Play Console, and closed-testing gates from Phases 17–19.

Phase 20 is complete for local code, safety boundaries, documentation, and automated checks. Diagnostics are not a substitute for an external error-reporting or uptime service.
