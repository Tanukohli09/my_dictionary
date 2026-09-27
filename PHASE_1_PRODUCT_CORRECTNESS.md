# Phase 1 — Product Correctness

**Project:** My Dictionary
**Phase:** 1 of the production-readiness plan
**Started:** 2026-09-27
**Status:** Complete; waiting for confirmation before Phase 2.

## Scope

Phase 1 implemented the product-correctness work agreed in Phase 0 for the confirmed web-first, local-first, English-only release direction. No provider replacement or production deployment was attempted in this phase.

## Completed work

### 1. Clean-install onboarding

- New installations now enter onboarding instead of being treated as already onboarded.
- The onboarding copy explains that saved words stay in the current browser/device and that searches use the dictionary service.
- Existing onboarding completion remains stored through the existing versioned key.

Changed files:

- [`src/services/wordStorage.ts`](src/services/wordStorage.ts)
- [`src/screens/OnboardingScreen.tsx`](src/screens/OnboardingScreen.tsx)

### 2. Demo content and fake progress removed from public flows

- Profile no longer substitutes hardcoded totals, reviewed counts, favourites, XP, alphabet bars, or a seven-day streak.
- Recent words no longer fall back to hardcoded sample rows when the collection is empty.
- The dictionary list no longer filters out a special demo word.
- Alphabet statistics now reflect the actual saved collection.

Changed files:

- [`src/screens/ProfileScreen.tsx`](src/screens/ProfileScreen.tsx)
- [`src/screens/SearchScreen.tsx`](src/screens/SearchScreen.tsx)
- [`src/modules/dictionaryList.ts`](src/modules/dictionaryList.ts)

The source file [`src/data/demoWords.ts`](src/data/demoWords.ts) remains available as development/test data, but it is no longer used to present fake public progress.

### 3. Real profile metrics

- Total words are calculated from the saved collection.
- Reviewed count is calculated from saved word review counters.
- Review attempts are calculated from completed review submissions.
- Current streak is calculated from consecutive review dates, including today or the most recent active day.
- Favourite ratio is calculated from actual favourites.
- The Favourites profile action now opens the dictionary with the favourites sort selected.

New utility:

- [`src/utils/reviewStats.ts`](src/utils/reviewStats.ts)

### 4. Word deletion and saved-data management

- Word details now include a confirmed “Remove from dictionary” action.
- Removal returns the user to the saved-word flow and reloads local state.
- Profile now has a “Your local data” section.
- Users can clear saved words and review history after confirmation.
- Data-action errors are shown in the profile instead of silently failing.

Changed files:

- [`src/screens/WordDetailScreen.tsx`](src/screens/WordDetailScreen.tsx)
- [`src/screens/ProfileScreen.tsx`](src/screens/ProfileScreen.tsx)
- [`src/navigation/AppNavigator.tsx`](src/navigation/AppNavigator.tsx)
- [`src/services/wordStorage.ts`](src/services/wordStorage.ts)

### 5. Local export and import

- Users can export a versioned JSON backup containing saved words and review history.
- Web users can download a backup file.
- Native callers receive a share action for the same backup payload.
- Web users can import a My Dictionary JSON backup through the profile screen.
- Imported records are normalized, deduplicated by normalized word, and checked before replacing local data.
- Unsupported or invalid files produce a user-visible message.

New service:

- [`src/services/localDataTransfer.ts`](src/services/localDataTransfer.ts)

This is intentionally a local-first backup flow, not account synchronization.

### 6. Retry and recovery states

- Dictionary errors now include a retry action while preserving the failed search text.
- Initial local-data loading failures show a recoverable error screen rather than leaving a blank app state.
- Meaning-save failures and word-delete failures are surfaced in the detail screen.

Changed files:

- [`src/components/ErrorState.tsx`](src/components/ErrorState.tsx)
- [`src/navigation/AppNavigator.tsx`](src/navigation/AppNavigator.tsx)
- [`src/screens/SearchScreen.tsx`](src/screens/SearchScreen.tsx)
- [`src/screens/WordDetailScreen.tsx`](src/screens/WordDetailScreen.tsx)

### 7. Source disclosure

- Definition pages now show the source provider returned by the dictionary service.
- Known Datamuse, Wiktionary, and Free Dictionary API sources link to their source/API pages.
- Unknown or configured providers are displayed generically rather than hiding the source entirely.

New component:

- [`src/components/SourceAttribution.tsx`](src/components/SourceAttribution.tsx)

This is a disclosure foundation. The provider and legal attribution policy are still a Phase 0/P2 launch gate and have not been approved by this implementation.

### 8. Small interaction/accessibility improvements

- Search inputs have accessible labels.
- Saved word cards have meaningful accessible names.
- Favourite controls expose selected state and labels.
- Source links expose link semantics.
- Status messages use polite live-region behavior where supported.
- The greeting now correctly distinguishes morning, afternoon, and evening.

## Verification completed

The following checks passed after the Phase 1 changes:

- `npm run typecheck`
- `npm run test:phase1`
- `npm run test:review`
- `npm run test:owl`
- `npm run build:web`

Browser smoke checks on the local website also confirmed:

- the clean-install onboarding screen appears;
- onboarding opens the rebuilt Search screen;
- Profile displays actual stored counts rather than demo values;
- Favourites and review metrics are present;
- Dictionary word detail shows source disclosure;
- Word detail exposes the removal action.

## Known limitations carried forward

These are intentionally not Phase 1 work:

- The current Datamuse/Wiktionary provider arrangement remains staging-only until quality, quota, terms, licensing, and attribution are approved.
- No production HTTPS deployment, strict CORS, security headers, monitoring, or shared cache/rate-limit store was added.
- Accounts, cloud sync, and server-side backups were not added.
- Import is implemented for the web-first release; native file-picking UX can be expanded when native apps are prioritized.
- The fixed featured “Word of the day” content is still a product enhancement candidate.
- The Playwright navigation command remains unreliable in this environment and did not complete during this phase; it was stopped after hanging without reaching the test result. The E2E harness needs a separate deterministic-test fix before it can become a release gate.
- Full keyboard, screen-reader, mobile-device, load, and security testing remain outstanding.

## Phase 1 exit criteria

- [x] Clean-install onboarding is correct.
- [x] Demo/fake user progress is removed from public screens.
- [x] Profile metrics use real local data.
- [x] Users can remove a saved word.
- [x] Users can clear saved words and review history.
- [x] Users can export and import local data on the web.
- [x] Search and local-data failures have recovery paths.
- [x] Dictionary source disclosure is visible.
- [x] Typecheck, phase tests, existing review/owl tests, and web build pass.
- [ ] Phase 2 confirmation received.

## Next phase after confirmation

Phase 2 is backend and security hardening:

1. Finalize and approve the production dictionary provider.
2. Configure production provider settings and attribution.
3. Harden HTTPS, CORS, security headers, rate limiting, and secrets.
4. Add request IDs, structured logs, provider health checks, metrics, and alerts.
5. Define deployment, rollback, and staging environments.

The project is paused here. I will not start Phase 2 until you confirm this Phase 1 completion.
