# Phase 19 — Android Play Store release readiness

Date: 2026-10-02

Status: Complete for repository-side release preparation. EAS credentials, a signed Android artifact, Play Console configuration, and external policy declarations still require owner action.

## What this phase delivered

- Locked the Android application identity to `com.tanukohli.mydictionary`.
- Kept the initial Android `versionCode` at `1`; the production EAS profile will auto-increment later releases.
- Declared an empty explicit Android permission list so a dependency cannot silently turn into an unreviewed permission request.
- Disabled cleartext traffic in the Android release configuration. Production APIs must use HTTPS.
- Added a deterministic `npm run test:phase19` preflight for the Android identity, icons, EAS App Bundle profile, privacy/support wording, and store documentation.
- Added this Play Store submission and data-safety worksheet so the final external declarations can be made from the actual release configuration.

## Release identity

| Item | Current repository value |
| --- | --- |
| App name | My Dictionary |
| Android package | `com.tanukohli.mydictionary` |
| Version | `1.0.0` |
| Initial version code | `1` |
| Production artifact | Android App Bundle (`.aab`) |
| Deep-link scheme | `mydictionary://` |
| Launcher icon | `src/assets/app-icon.png` |
| Adaptive foreground | `src/assets/app-icon-foreground.png` |
| Required Android permissions | None declared by the app |

Do not change the package ID after the Play application is created. A different package ID creates a different Play Store application and cannot receive updates to the original one.

## Build sequence

Run these only after the Supabase/Google staging checks in Phases 15–18 pass:

```bash
npx eas login
npx eas project:init
npx eas build --platform android --profile preview
```

Install the preview APK on a physical Android device and verify:

- first-run onboarding and clean local storage;
- common, uncommon, invalid, not-found, timeout, and offline searches;
- save, favourite, notes, review, export, clear data, and restore behavior;
- Google sign-in, sign-out, account switching, and callback return;
- two-account cloud isolation;
- account deletion and local-cache removal;
- Android Back behavior, keyboard behavior, adaptive icon, and dark/light presentation.

Only after the preview pass succeeds:

```bash
npx eas build --platform android --profile production
npx eas submit --platform android --profile production
```

The production command must produce a signed App Bundle. Signing credentials and Play service-account credentials belong in EAS/Play Console, never in Git or Expo public variables.

## Play Store listing draft

### Short description

Search, save, and master new English words.

### Full description

My Dictionary helps you turn new words into lasting vocabulary.

- Search English words and read clear definitions, examples, pronunciation, synonyms, and antonyms when the source provides them.
- Save words to your personal wordbook and add your own meanings, notes, and favourites.
- Review saved vocabulary with a focused quiz-style practice flow.
- Browse your collection alphabetically and track real review activity.
- Export a backup before changing devices or clearing local data.
- Use the app locally without an account. Optional Google sign-in enables synchronized wordbook data when that release is configured.

Dictionary results come from the configured dictionary service and its approved sources. Review the in-app Privacy and Support information before sharing the app publicly.

This copy is a draft. The owner should revise it after the final provider, account, language, and support decisions are approved.

## Data-safety worksheet

Complete the Play Console Data safety form from the exact release build and current provider configuration. The repository currently indicates the following items for review; these are not a substitute for the owner's legal/policy declaration:

| Data or behavior to review | Why it may apply | Current product handling |
| --- | --- | --- |
| Email address and display name | Optional Google sign-in | Used for the authenticated account/profile when cloud auth is enabled |
| User-generated content | Saved words, personal meanings, notes, favourites, review history | Stored locally; synchronized to the signed-in user's Supabase rows when cloud sync is enabled |
| Search terms | New words are sent to the hosted dictionary service | Used to return definitions; provider/host policies and retention must be confirmed |
| Account deletion | User-requested deletion | Deletes the Auth user and cascaded cloud rows, then clears the local account cache after the Edge Function is deployed |
| Ads and analytics | Current repository has no intentional ads or product analytics | Recheck before every release if new SDKs are added |
| Encryption in transit | Production APIs and OAuth must use HTTPS | Confirm the final Render, Supabase, Google, and EAS configuration before declaration |

Before submission, confirm whether each data type is collected, shared, optional, encrypted in transit, retained, and deleted. Do not copy staging assumptions into the production declaration.

## Required Play Console assets and declarations

- Final 512×512 store icon reviewed on an Android device.
- Phone and tablet screenshots from the production candidate.
- Feature graphic and store promotional copy if required by the selected track.
- Public privacy-policy URL that matches the deployed release.
- Support/contact URL and account-deletion instructions.
- Content rating questionnaire.
- Target audience and app-content declarations.
- Data-safety form matching the configured Google/Supabase/provider behavior.
- Closed-testing track, tester list, feedback path, and release notes.
- A rollback/previous-version plan and an owner who can monitor the first release.

## External gates still pending

- Create/link the EAS project and signing credentials.
- Apply the Supabase schema and deploy `delete-account`.
- Configure Google OAuth for the final package and EAS signing fingerprints.
- Complete the two-account, offline, and account-deletion staging matrix.
- Build/install the preview APK on a physical device.
- Review the listing, privacy policy, provider attribution, Data safety form, and content rating.
- Run Play closed testing before production publication.

Phase 19 is complete for local release configuration, documentation, and automated preflight. It is not a claim that the Android app is already published or ready for an unrestricted Play Store launch.
