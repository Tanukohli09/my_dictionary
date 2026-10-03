# Phase 22 — Accessibility and mobile interaction hardening

Date: 2026-10-02

Status: Complete for repository-side implementation. Real-device assistive-technology testing remains an external release gate.

## What this phase delivered

- Added a specific accessible hint to the two search fields so users know whether a field submits a dictionary lookup or filters saved words.
- Increased the shared search field and compact bookmark/header controls to a 44px interaction target, and enlarged alphabet-index letter targets for touch use.
- Marked loading and error content as accessible progress/alert states so network feedback is announced instead of only shown visually.
- Added busy state and action hints to account, backup, destructive, and removal buttons.
- Added a header role to shared screen headings and removed inert header icon buttons from the accessibility tree when no action is available.
- Made answered review options disabled and announced the next-question action, preventing accidental duplicate answers.
- Added a safe pronunciation handoff that accepts only HTTPS URLs, checks whether the platform can open them, catches failures, and displays an accessible message when audio is unavailable.

## User behavior

- Keyboard and screen-reader users can understand what each search field does before submitting text.
- A search failure or in-progress lookup has an announced status, while the visual loading treatment remains unchanged.
- Once a quiz answer is recorded, the answer controls are no longer presented as actionable; the user is directed to the next question.
- Broken, insecure, or unsupported pronunciation URLs fail in the app with a clear message instead of producing an unhandled promise rejection or silent no-op.
- Google sign-in, account deletion, backup, and destructive actions expose their busy/disabled state while work is in progress.

## Verification

```bash
npm run test:phase22
npm run typecheck
npm run test:e2e
```

The credential-free Phase 22 check protects the URL allowlist, accessibility states, control sizing, CI wiring, and documentation. The existing browser accessibility suite continues to cover named search/menu/navigation controls.

## Remaining release gate

This phase improves the code-level baseline; it is not a substitute for testing with TalkBack/VoiceOver, a hardware keyboard, browser zoom, high-contrast settings, reduced-motion preferences, and small Android screens. Those checks should be completed on the signed Android preview and the hosted web release before public launch.

Phase 22 is complete for local implementation and automated regression coverage.
