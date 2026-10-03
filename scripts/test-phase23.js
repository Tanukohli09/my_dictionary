const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const memory = new Map();
const AsyncStorage = {
  async getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  async setItem(key, value) { memory.set(key, value); },
  async removeItem(key) { memory.delete(key); },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return { __esModule: true, default: AsyncStorage };
  if (request === './auth') return { getCurrentAuthUserId: async () => null };
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, filename);
};

const storage = require('../src/services/wordStorage.ts');

const word = {
  id: 'recovery-word',
  word: 'Recovery',
  normalized_word: 'recovery',
  meaning_short: 'the act of returning to a normal state',
  definitions: [],
};

(async () => {
  await AsyncStorage.setItem('my-dictionary.words.v1', '{not-json');
  assert.deepEqual(await storage.loadWordEntries(), []);
  assert.equal(storage.getStorageHealth().needsRecovery, true);
  assert.equal(storage.getStorageHealth().issues[0].reason, 'invalid-json');
  const recovery = JSON.parse(await AsyncStorage.getItem(storage.getStorageRecoveryKey('words')));
  assert.equal(recovery.raw, '{not-json');

  storage.clearStorageHealth();
  memory.clear();
  await AsyncStorage.setItem('my-dictionary.words.v1', JSON.stringify([word, null]));
  assert.deepEqual(await storage.loadWordEntries(), [word]);
  assert.equal(storage.getStorageHealth().issues[0].reason, 'invalid-entry');

  await storage.persistWordEntries([word]);
  assert.equal(storage.getStorageHealth().needsRecovery, false);
  await storage.clearAllWords();
  assert.equal(await AsyncStorage.getItem(storage.getStorageRecoveryKey('words')), null);

  const source = fs.readFileSync(path.join(root, 'src/services/wordStorage.ts'), 'utf8');
  const navigator = fs.readFileSync(path.join(root, 'src/navigation/AppNavigator.tsx'), 'utf8');
  const notice = fs.readFileSync(path.join(root, 'src/components/StorageRecoveryNotice.tsx'), 'utf8');
  const recoveryE2E = fs.readFileSync(path.join(root, 'e2e/storage-recovery.spec.js'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/quality.yml'), 'utf8');
  const phaseDoc = fs.readFileSync(path.join(root, 'PHASE_23_STORAGE_RECOVERY.md'), 'utf8');

  assert.match(source, /my-dictionary\.recovery\.words\.v1/);
  assert.match(source, /invalid-json/);
  assert.match(source, /invalid-entry/);
  assert.match(source, /getStorageHealth/);
  assert.match(source, /original storage value is never deleted/);
  assert.match(navigator, /StorageRecoveryNotice/);
  assert.match(navigator, /storageRecovery/);
  assert.match(notice, /accessibilityRole="alert"/);
  assert.match(notice, /Open Profile to recover/);
  assert.match(recoveryE2E, /corrupted local storage/);
  assert.match(recoveryE2E, /Open Profile to recover saved data/);
  assert.equal(packageJson.scripts['test:phase23'], 'node scripts/test-phase23.js');
  assert.match(workflow, /npm run test:phase23/);
  assert.match(phaseDoc, /recovery/i);
  assert.match(phaseDoc, /corrupt|invalid/i);
  assert.match(phaseDoc, /backup/i);

  console.log('Phase 23 storage integrity and recovery checks passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
