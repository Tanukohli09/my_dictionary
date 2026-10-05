# Phase 29 — Android smoke test and mobile containment

Updated: October 3, 2026 (Asia/Kolkata)

## Completed

- Reserved the Android bottom system inset in the app's main safe area. The Search, Dictionary, Review, and Profile navigation remains above the phone's system navigation controls instead of colliding with them.
- Made first-run onboarding vertically scrollable on short displays, with a growing content container so the call to action and legal/support links remain reachable instead of spilling outside the screen.
- Added regression assertions and Playwright coverage for short first-run screens and a signed-out Profile screen at narrow mobile dimensions. The Profile's lower content scrolls while the main navigation remains usable.
- Fixed the native splash configuration to point at the existing foreground asset; without it, the Android release build failed because the generated `splashscreen_logo` resource was missing.
- Configured the EAS **preview** profile to use the existing Render staging dictionary API. A locally built Android app otherwise fell back to the public dictionary host that was unreachable from the test phone. The Render staging endpoint responded successfully.

## Verification

- `npm run test:all` passed: TypeScript, web export, all Node/phase/security/release checks, and **23 Playwright tests**.
- Both new mobile-containment browser tests passed, including onboarding at 360×480 and signed-out Profile at 360×640.
- Built and installed the Android release-variant APK on the connected Realme RMX2001. On-device staging smoke checks found `owl` and showed definitions, saved it locally, and showed it again after restarting the app. A nonsense word produced the expected not-found state. The app opened without a crash.
- Inspected the Profile tab on-device after the safe-area change; the bottom tabs were above the Android system controls, and scrolling the Profile moved its content without moving the tabs over the system bar.
- The phone's app data was not cleared and no user account or saved data was deleted.
- `git diff --check` passed.

## Local build artifact

- APK: `.expo/android-build/project/android/app/build/outputs/apk/release/app-release.apk` (72,708,842 bytes)
- SHA-256: `fe509b637c3f0d19d9a7cf4db518162aa0274bf84d0ba364fc33670121113f30`
- This is a local release-variant APK signed with a debug/test key. It is **not** a production-signed Play Store artifact and was not published.
- Device screenshots are retained locally under `.expo/android-build/screens/`, including `final-profile-safearea.png`, `final-profile-scrolled.png`, `staging-owl-result.png`, `staging-not-found.png`, and `staging-restart.png`. These build outputs are ignored by Git.

## Still required before public launch

- Produce a production-signed Android App Bundle using the production EAS profile and validate its OAuth/API configuration. The preview profile currently points to staging by design.
- Complete the outstanding live account-isolation, offline recovery, and account-deletion checks described in the earlier phase reports.
- Resolve the outstanding dependency-security release gate and complete Play Store listing, privacy/data-safety declarations, testing, and launch monitoring.

This phase verifies mobile layout behavior and a staging dictionary smoke test. It does not certify production readiness or authorize public release.
