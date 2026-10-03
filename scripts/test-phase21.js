const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const searchScreen = read('src/screens/SearchScreen.tsx');
const lookupE2E = read('e2e/lookup.spec.js');
const packageJson = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/quality.yml');
const phaseDoc = read('PHASE_21_REAL_EMPTY_STATES.md');

assert.doesNotMatch(searchScreen, /const sample|Ephemeral/);
assert.match(searchScreen, /dailyWords/);
assert.match(searchScreen, /Your first word is waiting/);
assert.match(searchScreen, /Search and save a word/);
assert.match(lookupE2E, /does not show demo word-of-day content/);
assert.match(lookupE2E, /Your first word is waiting/);
assert.equal(packageJson.scripts['test:phase21'], 'node scripts/test-phase21.js');
assert.match(workflow, /npm run test:phase21/);
assert.match(phaseDoc, /hard-coded.*demo word|hard-coded sample/i);
assert.match(phaseDoc, /empty-state|clean.*wordbook/i);
assert.match(phaseDoc, /actual saved wordbook|real saved entry/i);

console.log('Phase 21 real empty-state checks passed.');
