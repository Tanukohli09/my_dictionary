# My Dictionary Controlled Web Beta Runbook

## Purpose

This runbook covers an invite-only web beta on the hosted staging service. The release remains web-first and local-first: saved words and learning history stay in the user's browser or device, and the hosted service handles dictionary lookups.

The beta is not a native-store release, an account-sync release, or an unrestricted public launch.

## Pre-invite checklist

1. Confirm the intended GitHub main commit is marked Live in Render.
2. Confirm the deployed origin uses HTTPS and matches the configured allowed origin exactly.
3. Run the read-only beta smoke contract:

    BETA_BASE_URL=https://staging.example.com \
    BETA_WEB_ORIGIN=https://staging.example.com \
    BETA_EXPECTED_PROVIDER=datamuse \
    npm run beta:smoke

4. Open the deployed web app in a desktop browser and a mobile-sized viewport.
5. Search a common word, an uncommon word, a multi-word term, an apostrophe word, and a hyphenated word.
6. Confirm not-found and retry messages are understandable.
7. Confirm Privacy and Support are reachable before onboarding and from Profile.
8. Confirm the owner has reviewed the provider attribution and privacy wording.
9. Confirm an uptime monitor is watching /health and /ready, if monitoring has been configured.

## What the smoke contract checks

- process health and approved provider configuration;
- live provider readiness;
- exported web HTML and security headers;
- exact-origin CORS and API preflight;
- real lookups for representative words;
- request IDs and provider identity;
- an explicit not-found response;
- optional protected metrics access when an operator supplies a metrics token.

The script performs GET and OPTIONS requests only. It does not create accounts, modify saved words, or publish data.

## Beta acceptance criteria

Invite testers only when the pre-invite checklist passes and the owner has a support path. Record:

- browser/device and viewport;
- searched word and approximate time;
- visible error or unexpected definition;
- whether retry succeeded;
- whether local export/import and clear-data behavior worked.

Do not ask testers to upload private notes or backup files to public issues.

## Monitoring and incident response

- Use /health for process uptime and /ready for provider readiness.
- Keep the /metrics token server-side and access /metrics only from a protected operator environment.
- Treat repeated readiness failures, elevated lookup latency, 5xx responses, or rate-limit reports as launch-blocking until understood.
- Use the Support page for normal product reports and the Security Policy for suspected vulnerabilities.

## Rollback

1. Stop inviting testers if a launch-blocking regression appears.
2. In Render, open the last known-good deployment and use its rollback action, or redeploy the last known-good main commit.
3. Wait for the deployment to report Live.
4. Run the beta smoke contract against the rolled-back URL.
5. Record the failed commit, symptoms, smoke output, and the rollback commit in the release notes.

Never paste provider secrets or the metrics token into issues, chat, screenshots, or committed files.

## Owner gates still outside the repository

- legal and provider wording approval;
- GitHub private vulnerability reporting enablement;
- an external uptime monitor and alert destination;
- real desktop, mobile, keyboard-only, and screen-reader checks;
- a decision about a custom domain;
- native identifiers only if native distribution is later approved.
