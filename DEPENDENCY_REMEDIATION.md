# Dependency security remediation — October 2, 2026

## Result

Partially resolved: audit reduced from 9 moderate + 4 high to **0 moderate + 4 high**. The high-severity blocker is not resolved or waived.

Recovery update (October 3, 2026, Asia/Kolkata): the temporary checkout is no longer available. The active reconstructed release checkout is now `/home/tanu09/Downloads/my_dictionary-main/recovered-release`. See RECOVERY_REPORT.md for provenance and fresh verification. Nothing was pushed or deployed during recovery.

## Fixed

- Scoped npm override updates Xcode's transitive `uuid` from 7.0.3 to 11.1.1, with a reproducible package-lock update.
- Version 11 retains the CommonJS interface Xcode uses. Xcode uses `uuid.v4()` to generate project identifiers.
- Added `scripts/test-dependency-security.js`, automatically included by `npm run test:all`: checks the resolved version, rejects undersized v3/v5 buffers, and validates 100 distinct Xcode project identifiers.
- No Expo downgrade, audit suppression, or application feature changes.

UUID advisory: https://github.com/advisories/GHSA-w5hq-g745-h8pq

## Remaining upstream blocker

The four high findings represent node-forge and three dependent packages (`@expo/code-signing-certificates`, `@expo/cli`, `expo`), not four independent flaws. Installed node-forge 1.4.0 is affected by an RSA signature-validation vulnerability. The advisory currently lists no patched release:

https://github.com/advisories/GHSA-86w9-cpqp-85rv

Expo's certificate tooling actually invokes certificate/public-key verification. Replacing this cryptographic implementation with an unreviewed local patch is not a safe routine dependency upgrade. npm's suggested forced fix downgrades Expo to 44.0.6, incompatible with the current SDK 57 application, and was not applied.

The Docker runtime recipe does not copy node_modules, limiting runtime exposure for that deployment model; this does not fix the build/signing toolchain. Do not treat this report as approval to launch with the remaining risk. Closing this blocker requires a reviewed upstream fix or a separately evaluated supported toolchain replacement, followed by fresh audits and compatibility/signing tests.

## Verification

- `npm audit --json`: 0 moderate, 4 high, 0 critical; nonzero exit is expected while the blocker remains.
- `npm run test:all`: passed TypeScript, production web export, all 25 script-based suites, and all 21 browser tests.
- `npx --yes expo-doctor`: 21/21 checks passed.
- Native Android/iOS builds and signing were not run.

Work stops here awaiting the owner's next instruction; no additional phase or deployment started.
