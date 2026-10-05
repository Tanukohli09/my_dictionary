const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const audio = read('src/utils/audio.ts');
const searchBar = read('src/components/SearchBar.tsx');
const loading = read('src/components/LoadingState.tsx');
const error = read('src/components/ErrorState.tsx');
const primaryButton = read('src/components/PrimaryButton.tsx');
const screenHeader = read('src/components/ScreenHeader.tsx');
const navigator = read('src/navigation/AppNavigator.tsx');
const onboarding = read('src/screens/OnboardingScreen.tsx');
const review = read('src/screens/ReviewScreen.tsx');
const result = read('src/screens/WordResultScreen.tsx');
const detail = read('src/screens/WordDetailScreen.tsx');
const accessibilityE2E = read('e2e/accessibility.spec.js');
const lookupE2E = read('e2e/lookup.spec.js');
const reviewE2E = read('e2e/review.spec.js');
const packageJson = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/quality.yml');
const phaseDoc = read('PHASE_22_ACCESSIBILITY_MOBILE.md');

assert.ok(audio.includes('https://'));
assert.match(audio, /canOpenURL/);
assert.match(audio, /openURL/);
assert.match(result, /openPronunciationAudio/);
assert.match(detail, /openPronunciationAudio/);
assert.doesNotMatch(result, /Linking\.openURL\(word\.audio_url/);
assert.doesNotMatch(detail, /Linking\.openURL\(word\.audio_url/);
assert.match(result, /Pronunciation audio is unavailable right now/);
assert.match(detail, /Pronunciation audio is unavailable right now/);

assert.match(searchBar, /accessibilityHint/);
assert.match(searchBar, /minHeight: 44/);
assert.match(loading, /accessibilityRole="progressbar"/);
assert.match(error, /accessibilityRole="alert"/);
assert.match(primaryButton, /accessibilityState=\{\{ disabled, busy \}\}/);
assert.match(screenHeader, /accessibilityRole="header"/);
assert.match(navigator, /edges=\{\['top', 'left', 'right', 'bottom'\]\}/);
assert.match(onboarding, /<ScrollView[\s\S]*?contentContainerStyle=/);
assert.match(onboarding, /flexGrow:\s*1/);
assert.match(review, /accessibilityState=\{\{ selected: chosen, disabled: !!activeAnswer \}\}/);
assert.match(review, /disabled=\{!!activeAnswer\}/);
assert.match(accessibilityE2E, /accessible names and keyboard focus/);
assert.match(lookupE2E, /getByRole\('alert'\)/);
assert.match(reviewE2E, /toBeDisabled\(\)/);

assert.equal(packageJson.scripts['test:phase22'], 'node scripts/test-phase22.js');
assert.match(workflow, /npm run test:phase22/);
assert.match(phaseDoc, /accessibility/i);
assert.match(phaseDoc, /44px|44 px/);
assert.match(phaseDoc, /pronunciation.*audio|audio.*unavailable/i);
assert.match(phaseDoc, /manual|real-device/i);

console.log('Phase 22 accessibility and mobile interaction checks passed.');
