# Supabase staging setup

Updated: October 3, 2026 (Asia/Kolkata)

## Configured

- Free project `my-dictionary-staging` in South Asia (Mumbai): `soegyntnmockefzcpbns`.
- Data API enabled, automatic table exposure disabled, automatic RLS enabled.
- Applied `initial_my_dictionary_schema`: `profiles`, `word_entries`, and `review_submissions`, each with RLS and account ownership policies. Explicit grants allow authenticated clients; anonymous clients cannot select these tables.
- Deployed `delete-account` Edge Function, version 1, with JWT verification enabled. A live account deletion has not been tested.
- Supabase security advisor returned no findings after restricting the automatic RLS helper's execution rights.
- Set the Auth site URL to `https://my-dictionary-staging.onrender.com` and allowed exact web, local, and `mydictionary://auth/callback` redirects.
- Local ignored `.env.local` contains the public project URL and publishable key. No service role key is stored in the app or repository.
- Added the same public URL and publishable key to the Render staging service's build environment using **Save only**; the running deployment was not rebuilt. The local web export passes.
- Added an explicit `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED` release switch, defaulting to off. A Supabase URL/key alone no longer exposes a Google button before the provider is ready. Render deployed this gate in commit `eec1744` and the hosted Profile screen was verified.
- The user accepted Google Cloud's Terms of Service and Google API Services User Data Policy. The `My Dictionary Staging` Google Cloud project (`my-dictionary-staging`) and OAuth configuration are created.
- A web OAuth client named `My Dictionary Supabase Staging` was created with only the Supabase callback as its redirect. Its client ID is entered in Supabase. The Google client secret must be transferred directly by the owner to Supabase; it is not stored in code or this report. The owner was added as the sole Google OAuth test user. Google's publishing status is still **Testing**.
- The complete local test command `npm run test:all` passed outside the restricted sandbox: TypeScript, web build, Node suites, release smoke, server hardening, and 21 browser tests. An initial sandboxed run failed only at tests requiring localhost binding (`EPERM`); the unrestricted rerun passed.

## Still needed

- The owner must paste the Google client secret directly into Supabase's Google provider, enable it, and save. Until verified, Google sign-in is disabled. The client ID and callback are already configured.
- Complete Google's branding page and change the OAuth app from Testing to Production before inviting arbitrary users. Google currently allows only the listed test account; the branding/authorized-domain and any required verification steps remain launch gates.
- The recovered release is now deployed and verified on staging; see `PHASE_27_STAGING_DEPLOYMENT.md`. A second build will be needed only after the Google provider is connected and the release flag is enabled.
- Run real two-account sign-in, cloud isolation, offline recovery, and deletion tests. Native Android OAuth also needs an EAS signed build and its Google client configuration.
- A fresh npm audit reports 16 high dependency-chain entries through unpatched `node-forge` and `braces` advisories; see `DEPENDENCY_REMEDIATION.md`.
- Android device deployment, installation, and on-device testing are reserved for a `gpt-6-luna` subagent at `max` reasoning effort, per the owner's instruction. No device action has been taken in this setup phase.

No claim of live Google sign-in or public launch readiness is made here.
