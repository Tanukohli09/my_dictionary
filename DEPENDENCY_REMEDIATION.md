# Dependency security remediation — updated October 5, 2026

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

The October 5 audit again reports 16 high findings, all rooted in at least two advisories in the Expo/Metro build and native toolchain, not 16 independently exploitable web-server paths. Installed `node-forge@1.4.0` (through Expo CLI and `@expo/code-signing-certificates`) is affected by an RSA signature-validation vulnerability. GitHub currently lists no patched release, and the upstream remediation pull request remains open:

https://github.com/advisories/GHSA-86w9-cpqp-85rv

https://github.com/digitalbazaar/forge/pull/1152

Installed `braces@3.0.3` (through `micromatch` and Expo Metro file-map packages) is also affected by a stack-exhaustion denial-of-service advisory. GitHub currently lists no patched release:

https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

Expo's certificate tooling actually invokes certificate/public-key verification. Replacing this cryptographic implementation with an unreviewed local patch is not a safe routine dependency upgrade. The current npm audit suggests forcing Expo to 44.0.6 and React Native to 0.72.17. Those major downgrades do not match the SDK 57 application and were not applied. No advisory suppression or speculative patch was added. Recheck for maintainer-published fixes or a supported Expo toolchain update, then rerun the audit and compatibility/signing checks.

The Docker runtime recipe copies only the static web export and server source, not `node_modules`, and the static bundle did not contain the `node-forge` or `braces` package names in a text search. That limits exposure for the hosted web runtime but does not prove the Android build/signing toolchain is safe. Do not treat this report as approval to launch with the remaining risk. Closing this blocker requires reviewed upstream fixes or a separately evaluated supported toolchain replacement, followed by fresh audits and compatibility/signing tests.

## Verification

- Fresh `npm audit --json` on October 5 against the npm registry: 0 info, 0 low, 0 moderate, 16 high, 0 critical. All 16 entries are transitive dependency findings; the audit exits nonzero while they remain.
- `npm ls node-forge braces --all --depth=5` confirmed `node-forge@1.4.0` and `braces@3.0.3` in the current lock tree. The October 5 advisory review found no released patched versions for either package.
- `npm run test:all`: passed TypeScript, production web export, all 25 script-based suites, and all 21 browser tests.
- `npx --yes expo-doctor`: 21/21 checks passed.
- Native Android/iOS builds and signing were not run.

Staging deployment and the release-gate work are documented separately; this report is the current security-gate status, not a claim of remediation.
