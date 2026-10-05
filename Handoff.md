# My Dictionary — Handoff

Updated: October 6, 2026 (Asia/Kolkata)

Use this note to continue the work in a new chat. The authoritative Git checkout is the nested `recovered-release` directory, not its parent folder.

## Project and current state

- Project: Expo / React Native vocabulary dictionary, with a web app, local-first saved words, optional Google sign-in/cloud sync, and Android builds.
- Git root: `/home/tanu09/Downloads/my_dictionary-main/recovered-release`
- Branch: `main`; remote privacy/deletion commits were fetched and merged locally as `8d0296c` (`Merge remote-tracking branch 'origin/main'`). Release preparation is committed as `c4f59ce` (`Prepare My Dictionary Play release`) and is pending push/deployment verification.
- Staging URL: <https://my-dictionary-staging.onrender.com/>
- The Oct 6 changes include the Play release configuration, server-side Wiktionary identification and request limits, licensing attribution, onboarding/profile mobile fixes, account-deletion wording, and store assets. `DEPENDENCY_REMEDIATION.md` records the latest security review. `PRIVACY_POLICY_DRAFT_FOR_REVIEW.md` remains an untracked owner-review draft and must not be mistaken for the live policy. Preserve any later user changes; do not reset or force-push.

## Recent work

- Dictionary lookup is routed through the Render web service at `/api/dictionary/<word>`. The current Render blueprint declares the **free** plan, Datamuse as primary provider, and Wiktionary as fallback (`render.yaml`). The same Node service serves the exported web app and handles dictionary API requests (`server/dictionaryProxy.js`).
- Free Render web services spin down after 15 minutes idle and take about a minute to wake. The client timeout for hosted lookups was raised to 75 seconds (`src/services/dictionaryApi.ts`) so a cold start is less likely to become a false “service unavailable” error. This is a hosting-tier delay, not evidence of a dictionary-provider free tier. A provider timeout/failure after Render is awake is still a separate possibility; check Render logs and the actual API response if searches keep failing. See [Render free-service limits](https://render.com/docs/free) and [Render FAQ](https://render.com/docs/faq).
- The remote repo now includes the public privacy policy and account-deletion pages; the local branch has merged those changes. The Oct 6 commit includes the application and release-preparation updates. **Confirm Render reports that commit Live and rerun the hosted smoke after push before claiming those changes are deployed.**
- Phase 29 addresses Android bottom navigation/system-bar overlap and signed-out onboarding overflow; its report records a successful physical-device smoke test.
- Phase 30 removes the Profile “Words by alphabet” graph while retaining local-data controls; the report records on-device visual verification.
- Phase 31 enables Google auth in the local Android preview build and records a successful build/install on the connected Realme RMX2001. That APK is locally test-signed, not a Play Store artifact.
- EAS project `@tanukohlis-team/my-dictionary` is linked, production public variables are configured for the production Supabase project and the free Render dictionary endpoint, and Expo's free plan is selected. The earlier production build was cancelled because it predated the account-deletion wording fix. No current production AAB has been built.
- Production Supabase Google sign-in is enabled, its callback was registered in the existing Google OAuth client, and the OAuth audience was published to production. Browser work reported these changes saved; **real production sign-in, sync, and account deletion have not yet passed end-to-end acceptance.**

## Verification evidence and limits

- Phase 29: `npm run test:all` passed at that point, including 23 Playwright tests; Android preview APK installed and smoke-tested.
- Phase 30: `npm run typecheck`, `npm run test:phase22`, and the targeted Profile Playwright tests passed; the updated APK was installed and the removed graph was visually checked on-device. The full suite was not rerun after this edit.
- Phase 31: `npm run test:phase13`, typecheck, and targeted account Playwright tests passed; local Android release-variant build and in-place install succeeded. The existing phone session was preserved; no sign-out, uninstall, data clear, or account deletion was performed.
- The reports are in `PHASE_29_ANDROID_MOBILE_CONTAINMENT.md`, `PHASE_30_PROFILE_SIMPLIFICATION.md`, and `PHASE_31_GOOGLE_AUTH_ANDROID_PREVIEW.md`. These are currently untracked alongside the related code edits.
- On October 6, `npm run test:all` passed with loopback access enabled: TypeScript, production web export, all 25 script suites, and all 25 Playwright tests. The default sandbox run failed only because it denied local `127.0.0.1` server binds; the authorized rerun passed.
- The hosted monitor against free Render staging initially saw `/health` return 503 during a cold start, then passed on its retry with `owl`, `apply`, `sesquipedalian`, and a not-found word. This check was before the Oct 6 code push; rerun after the latest commit deploys.
- An online `npm audit --json` on October 5 reported 16 high, zero moderate or critical findings. The affected `node-forge@1.4.0` and `braces@3.0.3` have no released patched versions in the reviewed advisories; npm's suggested Expo/React Native downgrades are incompatible and were not applied. See `DEPENDENCY_REMEDIATION.md`.

## Remaining work, in a safe order

1. Confirm the pushed commit is Live on Render and rerun the hosted smoke. Keep the existing Render and Supabase services on free plans.
2. Complete live acceptance with dedicated test accounts: sign in, verify two-account data isolation, sign out/re-sign in, offline sync/recovery, and account deletion. Confirm deletion affects only the test account. Do not delete the owner's account or real user data.
3. Keep the dependency release hold until maintainers publish fixes or a supported Expo toolchain resolves both findings; rerun audit, compatibility, and signing checks afterward. Do not force-downgrade Expo or suppress the audit.
4. After staging acceptance and the security gate are resolved, build the corrected production-signed Android App Bundle, verify the artifact, and upload it to Play Console.
5. Finish any remaining accurate Play declarations, start closed testing, and wait until at least 12 real testers have opted in continuously for 14 days. The owner said they will arrange the testers and enter their emails in Play Console. Then request production access and complete Google's review/release steps.

See `PHASE_15_AUTH_AND_ANDROID_VALIDATION.md`, `PHASE_17_RELEASE_PREFLIGHT.md`, `PHASE_18_ACCOUNT_DELETION.md`, `PHASE_19_ANDROID_PLAY_RELEASE.md`, `PHASE_26_LAUNCH_STATUS.md`, and `DEPENDENCY_REMEDIATION.md`. Some earlier phase reports predate later configuration; prefer the newest reports and verify live account state instead of assuming documentation is current.

## Authorization and operating constraints

The owner has explicitly requested completion of the remaining launch work and publication of the app as **free**. Committing/pushing the recovered My Dictionary code, deploying to the existing Render **staging** service, configuring the existing Supabase and Google OAuth projects, and running tests are authorized. Keep backend hosting on the existing free tiers; do not spend money or delete the owner's account or real user data. The owner will arrange the 12 real testers and enter their emails in Play Console. Follow Google's closed-test and production-access requirements; do not represent a draft, bundle, or closed test as a public release.

For any Android physical-device build, installation, or test, use **only a `gpt-6-luna` subagent at maximum effort**. Do not use another agent for those device operations. Preserve app data and the signed-in session; avoid uninstall, data-clear, sign-out, or account deletion unless the specific test has been planned and authorized. Never put OAuth client secrets, Supabase service-role keys, database passwords, or signing credentials in chat or source control.

## Suggested opening message in the next chat

“Continue from `recovered-release/Handoff.md`. First inspect the current Git status and diff without discarding changes, then verify the latest Render staging deployment and dictionary search. Keep the Android device-work restriction and release authorization limits in this handoff.”
