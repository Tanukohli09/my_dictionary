# Release checkout recovery

Date: October 3, 2026 (Asia/Kolkata)

## Permanent working location

`/home/tanu09/Downloads/my_dictionary-main/recovered-release`

The previous `/tmp/my_dictionary-phase9` checkout was missing. Neither original Downloads folder was overwritten. Use this recovered-release folder for subsequent release work, not the older parent project.

## What was recovered

- Cloned GitHub main at `505f354345c5000112e797412a17a248f71807ee` (Phase 11).
- Reconstructed later source, configuration, tests, and phase reports from this task's recorded patches, through Phase 26 and the UUID remediation.
- Restored the authentication dependencies and Expo plugins added by the previous Expo install operation.
- Regenerated the package lock and retained Expo 57.0.26 and the scoped UUID 11.1.1 override.
- Recovered original generated launcher artwork from the local image cache. These are the original 1254-pixel images, not the lost 1024-pixel optimized copies; this is not a byte-for-byte recovery of those assets.
- The old local commit objects were not recovered. This is a reconstructed source snapshot, not a restoration of the original Git history. Older phase reports describe historical results; fresh recovery checks are recorded below.
- No credentials or private environment files were reconstructed. Google/Supabase account setup, native signing, and production launch gates are not completed by this recovery.

## Dependency blocker

The clean dependency installation reports **0 moderate and 4 high findings**. The four high findings trace to node-forge 1.4.0 and its Expo dependents. npm still lists 1.4.0 as the latest release; the proposed upstream fix is open, not merged:

https://github.com/digitalbazaar/forge/pull/1152

No speculative cryptography patch, forced Expo downgrade, or audit suppression was applied. This recovery does not clear the security blocker or approve unrestricted launch.

## Verification

The initial run detected missing Expo plugin entries from the original install; those entries were restored before the final run.

Final fresh results:

- `npm ci --ignore-scripts`: passed; validates the reconstructed lockfile without running dependency lifecycle scripts.
- `npm run test:all`: passed TypeScript, web export, all 25 script suites, and all 21 browser tests.
- `npx --yes expo-doctor`: 21/21 checks passed.
- `npm audit --json`: 0 moderate, 4 high, 0 critical; the security blocker remains.
- `git diff --check`: passed.
- Native builds/signing, real Google OAuth, cloud sync with real accounts, and hosted deployment were not tested in this recovery.

No GitHub push, Render deployment, or Play Store submission was performed.
