const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { evaluate } = require('./release-preflight');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function runPreflight(args = [], overrides = {}) {
  return evaluate(overrides, args);
}

const packageJson = JSON.parse(read('package.json'));
const render = read('render.yaml');
const workflow = read('.github/workflows/quality.yml');
const phaseDoc = read('PHASE_17_RELEASE_PREFLIGHT.md');

assert.equal(packageJson.scripts['test:phase17'], 'node scripts/test-phase17.js');
assert.equal(packageJson.scripts['release:preflight'], 'node scripts/release-preflight.js');
assert.match(render, /EXPO_PUBLIC_OFFLINE_FALLBACK[\s\S]*?value: "false"/);
assert.match(render, /EXPO_PUBLIC_SUPABASE_URL[\s\S]*?sync: false/);
assert.match(render, /EXPO_PUBLIC_SUPABASE_ANON_KEY[\s\S]*?sync: false/);
assert.match(workflow, /npm run test:phase12/);
assert.match(workflow, /npm run test:phase16/);
assert.match(workflow, /npm run test:phase17/);
assert.match(phaseDoc, /--strict/);
assert.match(phaseDoc, /service-role/i);

const local = runPreflight();
assert.equal(local.failures.length, 0, local.failures.join('; '));
assert.match(local.warnings.join('\n'), /Supabase is not configured/i);

const missingStrict = runPreflight(['--strict']);
assert.ok(missingStrict.failures.length);
assert.match(missingStrict.failures.join('\n'), /requires the Supabase public client variables/i);
assert.match(missingStrict.failures.join('\n'), /DICTIONARY_ALLOWED_ORIGIN/i);

const validStrict = runPreflight(['--strict'], {
  EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_test_only',
  EXPO_PUBLIC_OFFLINE_FALLBACK: 'false',
  DICTIONARY_PROVIDER_APPROVED: 'true',
  DICTIONARY_ALLOWED_ORIGIN: 'https://dictionary.example.test',
  NODE_ENV: 'production',
  DICTIONARY_ENV: 'production',
});
assert.equal(validStrict.failures.length, 0, validStrict.failures.join('; '));

const unsafeProduction = runPreflight([], {
  EXPO_PUBLIC_OFFLINE_FALLBACK: 'true',
  DICTIONARY_PROVIDER_APPROVED: 'true',
  DICTIONARY_ALLOWED_ORIGIN: 'https://dictionary.example.test',
  NODE_ENV: 'production',
  DICTIONARY_ENV: 'production',
});
assert.ok(unsafeProduction.failures.length);
assert.match(unsafeProduction.failures.join('\n'), /OFFLINE_FALLBACK/);

console.log('Phase 17 release preflight checks passed.');
assert.ok(runPreflight(['--native'], { EXPO_PUBLIC_DICTIONARY_API_URL: '/api/dictionary' }).failures.length);
assert.equal(runPreflight(['--native'], { EXPO_PUBLIC_DICTIONARY_API_URL: 'https://dictionary.example.test/api/dictionary' }).failures.length, 0);
