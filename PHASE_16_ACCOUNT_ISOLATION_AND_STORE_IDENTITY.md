# Phase 16 — Account isolation and Android store identity

Date: 2026-10-02

Status: Complete for repository-side safeguards. Live OAuth, cloud RLS, and Android device verification still require the external setup listed in Phase 15.

## What this phase delivered

- Added a production launcher icon at [`src/assets/app-icon.png`](src/assets/app-icon.png).
- Added a transparent adaptive-icon foreground at [`src/assets/app-icon-foreground.png`](src/assets/app-icon-foreground.png).
- Declared both assets in `app.json`; the production EAS profile now has a concrete Android store identity instead of falling back to a generic Expo icon.
- Scoped saved words and review history by authenticated user in local storage.
- Preserved a controlled first-account migration path for legacy anonymous local data.
- Moved a signed-in user's local cache into their user-scoped storage before sign-out and removed the shared cache.
- Cleared in-memory words and review history when the authenticated user changes so account A's screen is not briefly shown to account B.
- Fixed review-history clear-all to clear the active user's scoped cache, not only the legacy shared key.
- Made web OAuth callback cleanup run even when the provider returns an error, preventing stale callback URLs from trapping the next launch.
- Added a deterministic account-isolation test using two mocked users; it requires no real credentials.

## The privacy issue that was fixed

Before this phase, all device data used the same local storage keys. If account A signed out and account B signed in on the same browser or phone, account A's local entries could be included in account B's initial cloud merge.

The storage boundary is now:

| State | Local data location | Visible to |
| --- | --- | --- |
| No account | Legacy anonymous cache | The unsigned-in device session |
| Signed in as A | User-scoped A cache | Account A only |
| Signed in as B | User-scoped B cache | Account B only |
| Signed out after A | No shared active cache | Neither account until its own session returns |

When the first configured account signs in on a device with legacy anonymous words, those words are migrated into that account's scoped cache. After that, the shared legacy keys are removed. A later account cannot inherit them.

## Verification

```bash
npm run test:phase16
npm run test:phase15
npm run typecheck
npm run test:e2e
npx expo config --json
```

The deterministic Phase 16 test verifies that:

- anonymous data can migrate to account A;
- signing out hides the shared cache;
- account B starts without account A's data;
- both accounts recover only their own scoped data after signing in again.

The full browser suite remains credential-free and continues to validate the local-first account fallback. The real two-account Supabase/RLS matrix in [Phase 15](PHASE_15_AUTH_AND_ANDROID_VALIDATION.md) is still required before a cloud release is approved.

## Android store identity

The Android configuration now resolves to:

```text
Icon: ./src/assets/app-icon.png
Adaptive foreground: ./src/assets/app-icon-foreground.png
Adaptive background: #FFF8E7
Package: com.tanukohli.mydictionary
```

The generated icon is a repository asset, not a Play Store submission. The owner still needs to review it on an actual Android launcher and provide the final Play listing screenshots, feature graphic, privacy/data-safety answers, content rating, support URL, and closed-test plan.

## External gates still pending

- Apply the Supabase schema and configure the public client variables.
- Enable Google and register the web/native redirects.
- Run the two-account isolation and offline retry matrix on the configured staging build.
- Build and install the EAS preview APK on a physical Android device.
- Confirm the icon, OAuth callback, sign-out behavior, and cloud sync on that device.
- Create the Play Console listing and complete the required policy declarations before submission.

This phase is complete for local code, assets, and repeatable tests. It does not claim that the hosted site or Play Store app is already configured.
