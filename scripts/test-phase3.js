const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
assert.equal(packageJson.scripts['test:e2e'], 'npm run build:web && playwright test --config=playwright.config.js --workers=1');
assert.equal(packageJson.scripts['test:phase3'], 'node scripts/test-phase3.js');

const playwright = read('playwright.config.js');
assert.match(playwright, /scripts\/start-e2e\.js --port 8082/);
assert.match(playwright, /reuseExistingServer: false/);
assert.match(playwright, /127\.0\.0\.1:8082/);

const e2eLauncher = read('scripts/start-e2e.js');
assert.match(e2eLauncher, /DICTIONARY_FALLBACK_PROVIDER: 'wiktionary'/);
assert.match(e2eLauncher, /DICTIONARY_REQUEST_TIMEOUT_MS: '250'/);
assert.match(e2eLauncher, /fallbackword/);
assert.match(e2eLauncher, /timeoutword/);
assert.match(e2eLauncher, /retryword/);

for (const file of ['e2e/lookup.spec.js', 'e2e/accessibility.spec.js', 'e2e/testData.js']) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} should exist`);
}

for (const file of ['src/components/BottomTabs.tsx', 'src/components/DesktopNavigation.tsx', 'src/components/AppMenu.tsx', 'src/screens/NoteScreen.tsx', 'src/screens/ReviewScreen.tsx']) {
  assert.match(read(file), /accessibilityRole/);
}

console.log('Phase 3 verification checks passed.');
