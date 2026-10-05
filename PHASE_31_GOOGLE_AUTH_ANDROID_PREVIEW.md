# Phase 31 — Enable Google authentication in the Android preview release

Updated: October 3, 2026 (Asia/Kolkata)

## Completed

- Diagnosed the Account message: Supabase URL and public client key were available, and Google Auth was already enabled in the staging Supabase project, but this Android bundle did not set `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true`. The client intentionally hides Google sign-in unless all three values are present.
- Verified the staging Auth settings report Google enabled. A read-only OAuth authorization request using `mydictionary://auth/callback` returned a redirect to Google's sign-in host, confirming Supabase accepts the app callback.
- Enabled the flag in the EAS `preview` profile. The `production` profile remains separate and is not pointed at staging by this change.
- Rebuilt the local Android release APK with the staging dictionary URL, existing local Supabase public URL/key, and Google-auth flag. Installed it over the existing phone app using `adb install -r`.
- The phone restored its existing authenticated session and now shows the signed-in account state. No sign-out, uninstall, data clear, or account deletion was performed.
- Ran the signed-out Account browser test in an isolated context with the staging public settings; it verified that a user without a session sees **Continue with Google**.

## Verification

- `npm run test:phase13` passed.
- `npm run typecheck` passed.
- `npx --no-install playwright test e2e/account.spec.js --config=playwright.config.js --workers=1` passed with the Google-auth-enabled web bundle and an isolated signed-out browser context.
- Android `:app:createBundleReleaseJsAndAssets --rerun-tasks --offline` and `:app:assembleRelease --offline` completed successfully; `adb install -r` returned `Success` on Realme RMX2001.
- The current phone session already existed, so I did not tap sign-in or sign-out. The app's Google OAuth audience remains in Testing mode; only accounts configured as test users can complete OAuth until that audience is separately published.

## Local Android preview artifact

- APK: `.expo/android-build/project/android/app/build/outputs/apk/release/app-release.apk` (local debug/test-signed APK, not a Play Store artifact)
- SHA-256: `8c83fc3d2562b88cb6abf9931b54a0cc2d016af2a2db93009bfa40d751090fcf`

## Remaining release boundary

This verifies the current locally built staging APK, not an EAS cloud build or public production release. When EAS is linked, its preview environment must also contain `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; the local `.env.local` file is not uploaded to EAS. Production must use production Supabase/OAuth settings rather than staging.

Supabase references: [Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google) and [mobile redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls).
