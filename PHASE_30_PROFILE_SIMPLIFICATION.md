# Phase 30 — Simplify the Profile screen

Updated: October 3, 2026 (Asia/Kolkata)

## Completed

- Removed the “Words by alphabet” bar graph from Profile, including its unused grouping calculation and chart-only styles.
- Kept “Your local data” and all existing Export backup, Import backup, and Clear saved data controls. The data card now follows the Profile summary directly without the extra chart spacing.
- Added a browser regression test that checks the graph stays absent and the local-data controls remain visible.

## Verification

- `npm run typecheck` passed.
- `npm run test:phase22` passed.
- `npx --no-install playwright test e2e/profile-desktop.spec.js --config=playwright.config.js --workers=1` passed: **3 tests**, including the new regression.
- The complete `npm run test:all` suite passed earlier in Phase 29, before this Profile-only change; it was not rerun after this edit.
- `:app:assembleRelease --offline` completed successfully, and the updated APK was installed on the connected Realme RMX2001 with `adb install -r` (in-place update). On-device visual verification confirmed the graph is absent, “Your local data” and its controls remain available after scrolling, and the bottom tabs stay above the Android system controls.
- No uninstall, app-data clear, or account changes were performed. The Profile showed **0 Total Words** during this check; this was observed, not caused by a data-clearing action in this update.

## Android test artifact

- APK: `.expo/android-build/project/android/app/build/outputs/apk/release/app-release.apk` (72,707,278 bytes; local debug/test signing, not a Play Store artifact)
- SHA-256: `74fbdfddf5f30f6499f839ed58eb4f2d1301e8bc9820a9fb2de50897d95017ed`
- On-device screenshots: `.expo/android-build/screens/profile-after-chart-removal.png` and `.expo/android-build/screens/profile-after-chart-removal-scrolled.png`.

This change only removes the Profile chart. It does not delete or alter saved words, review history, or local-data actions.
