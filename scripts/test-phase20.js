const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const dictionaryApi = read('src/services/dictionaryApi.ts');
const diagnostics = read('src/services/diagnostics.ts');
const infoScreen = read('src/screens/InfoScreen.tsx');
const legalE2E = read('e2e/legal.spec.js');
const packageJson = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/quality.yml');
const phaseDoc = read('PHASE_20_SUPPORT_DIAGNOSTICS.md');

assert.match(dictionaryApi, /getDictionaryLookupDiagnostics/);
assert.match(dictionaryApi, /x-request-id/);
assert.match(dictionaryApi, /offline-fallback/);
assert.match(diagnostics, /buildSupportDiagnostics/);
assert.match(diagnostics, /getCloudSyncSnapshot/);
assert.match(diagnostics, /getDictionaryLookupDiagnostics/);
assert.match(infoScreen, /Technical diagnostics/);
assert.match(infoScreen, /Copy technical diagnostics/);
assert.match(infoScreen, /saved words|notes|tokens/i);
assert.match(legalE2E, /Copy technical diagnostics/);
assert.equal(packageJson.scripts['test:phase20'], 'node scripts/test-phase20.js');
assert.match(workflow, /npm run test:phase20/);
assert.match(phaseDoc, /request ID/i);
assert.match(phaseDoc, /must not contain|excludes/i);
assert.match(phaseDoc, /Play Console|Play Store/i);

console.log('Phase 20 support diagnostics checks passed.');
