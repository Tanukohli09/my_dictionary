# Dependency security remediation — updated October 3, 2026

## Result

Partially resolved: the earlier 9 moderate findings were removed, but a fresh audit now reports **0 moderate + 16 high**. This is a change in the live advisory feed, not evidence that 16 independent flaws were introduced by the release. The high-severity blocker is not resolved or waived.

Recovery update (October 3, 2026, Asia/Kolkata): the temporary checkout is no longer available. The active reconstructed release checkout is now `/home/tanu09/Downloads/my_dictionary-main/recovered-release`. See RECOVERY_REPORT.md for provenance. The recovered release was subsequently pushed and deployed to staging; see PHASE_27_STAGING_DEPLOYMENT.md.

## Fixed

- Scoped npm override updates Xcode's transitive `uuid` from 7.0.3 to 11.1.1, with a reproducible package-lock update.
- Version 11 retains the CommonJS interface Xcode uses. Xcode uses `uuid.v4()` to generate project identifiers.
- Added `scripts/test-dependency-security.js`, automatically included by `npm run test:all`: checks the resolved version, rejects undersized v3/v5 buffers, and validates 100 distinct Xcode project identifiers.
- No Expo downgrade, audit suppression, or application feature changes.

UUID advisory: https://github.com/advisories/GHSA-w5hq-g745-h8pq

## Remaining upstream blockers

The current 16 high audit entries are dependency-chain effects of at least two direct advisories in the Expo/Metro build and native toolchain, not 16 independently exploitable web-server paths. Installed `node-forge@1.4.0` is affected by an RSA signature-validation vulnerability. The advisory currently lists no patched release:

https://github.com/advisories/GHSA-86w9-cpqp-85rv

Installed `braces@3.0.3` (through `micromatch` and Metro file-map packages) is also affected by a stack-exhaustion denial-of-service advisory. The current advisory lists no patched release:

https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

Expo's certificate tooling actually invokes certificate/public-key verification. Replacing this cryptographic implementation with an unreviewed local patch is not a safe routine dependency upgrade. npm's suggested forced fix downgrades Expo to 44.0.6, incompatible with the current SDK 57 application, and was not applied.

The Docker runtime recipe copies only the static web export and server source, not `node_modules`, and the static bundle did not contain the `node-forge` or `braces` package names in a text search. That limits exposure for the hosted web runtime but does not prove the Android build/signing toolchain is safe. Do not treat this report as approval to launch with the remaining risk. Closing this blocker requires reviewed upstream fixes or a separately evaluated supported toolchain replacement, followed by fresh audits and compatibility/signing tests.

## Verification

- Fresh `npm audit --json` on October 3: 0 moderate, 16 high, 0 critical; nonzero exit is expected while the blockers remain.
- `npm run test:all`: passed TypeScript, production web export, all 25 script-based suites, and all 21 browser tests.
- `npx --yes expo-doctor`: 21/21 checks passed.
- Native Android/iOS builds and signing were not run.

Staging deployment and the release-gate work are documented separately; this report is the current security-gate status, not a claim of remediation.
