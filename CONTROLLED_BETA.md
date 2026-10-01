# My Dictionary controlled beta

Status: Invite-only web beta. This packet is ready for manual sharing; no invitations are sent automatically.

Hosted beta URL:

    https://my-dictionary-staging.onrender.com

## What this beta is

- Web-first and local-first.
- Saved words, notes, favourites, review history, theme choice, and onboarding state stay in the tester's browser or device.
- New-word searches use the hosted My Dictionary service and its approved Datamuse provider with Wiktionary fallback.
- There is no account, cloud synchronization, native-store release, or unrestricted public launch in this beta.

## Tester checklist

Use a clean browser profile or private window for the first-run check.

1. Open the Privacy page before onboarding and confirm the local-storage explanation is understandable.
2. Search a common word such as owl.
3. Search an uncommon word such as sesquipedalian.
4. Try a word that should not be found and confirm the message explains what to do next.
5. Save a word, mark it favourite, add a personal meaning, and open Review.
6. Export a backup before trying Clear saved data, then import the backup if needed.
7. Open the app in a desktop-sized and mobile-sized viewport.
8. Use keyboard focus and the Support page.
9. Try a refresh and browser Back/Forward after opening a saved word.

## Safety rules

- Do not enter passwords, API keys, payment information, health information, or other sensitive content.
- Do not put private notes or backup files in a public issue.
- Export a backup before clearing browser data or changing devices.
- Saved words are local to the browser/device and are not synchronized between testers or devices.
- The service may be sleeping after inactivity; retry once if the first request takes longer.

## Privacy-safe feedback template

Use the GitHub issue tracker for normal product feedback. Include only:

- browser and device;
- approximate time and timezone;
- word searched;
- screen or URL;
- visible message;
- whether retrying helped;
- whether the issue can be reproduced.

Do not include private notes, backup files, credentials, API keys, or metrics tokens. Use the repository's private security reporting channel for suspected vulnerabilities.

## Owner release gates

Before widening the beta or announcing the site publicly, the owner should:

- review provider attribution, privacy, and support wording;
- complete at least one real mobile-browser and desktop-browser pass;
- confirm the GitHub Actions monitor has a recent successful run;
- decide whether a dedicated uptime provider or custom domain is needed;
- keep the rollback instructions in BETA_RUNBOOK.md available.

## Suggested invitation text

You are invited to try the My Dictionary web beta:

    https://my-dictionary-staging.onrender.com

It is a local-first vocabulary app. Your saved words and notes stay in your browser/device, and new searches use the hosted dictionary service. Please try a few searches, saving and reviewing a word, refresh/Back/Forward behavior, and the Privacy and Support pages. Do not enter sensitive information or share private notes in feedback. Report normal issues through the project's issue tracker.
