# My Dictionary Privacy Notice

**Status:** Plain-language product notice; review this with the owner's legal requirements before a public launch.

## What stays on your device

My Dictionary can be used without an account. Saved words, personal meanings, notes, favourites, review history, theme choice, and onboarding state are stored in local browser or device storage. In releases where account sync is configured, optional Google sign-in links that local wordbook to the authenticated user's cloud data through the configured authentication provider.

Use **Export backup** before changing devices. Use **Clear saved data** in Profile when you want to remove the local wordbook. Clearing browser site data or uninstalling the app also removes local storage.

## What happens when you search

When you submit a word, the word is sent to the hosted My Dictionary dictionary service. The service requests definitions from Datamuse and can fall back to Wiktionary when the primary provider is unavailable. Those providers and the hosting platform may process requests under their own policies and terms.

## Operational data

The dictionary service keeps a short-lived definition cache and records operational events such as request IDs, provider, status, latency, and cache hits. In configured account-sync releases, the Supabase database also stores your user-scoped saved words, notes, and review history so they can be synchronized. Hosting-provider access logs and retention rules may still apply.

The current local-first staging release does not intentionally use advertising trackers, analytics, or account profiling. When account sign-in and cloud synchronization are enabled, the provider processes the account and synchronized data under its own policies; this notice must be reviewed before public launch.

## Optional Google sign-in

When enabled for a release, Google and the authentication provider process the identity details needed for sign-in, such as your email address and display name. You can continue using the dictionary locally without signing in. Sign out from Profile to end the current session on the device.

If you sign in, Profile also provides **Delete account** after the account-deletion service is enabled. Deleting the account removes the authenticated account and synchronized words, notes, and review history; the app also removes that account's local cache from the current device. Export a backup first if you need a copy.

## Contact

For questions or product issues, use the [My Dictionary support tracker](https://github.com/Tanukohli09/my_dictionary/issues). Do not include private notes, backup files, passwords, API keys, or other sensitive information in a public issue.

Last reviewed: October 2026.
