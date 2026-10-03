const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

const memory = new Map();
let activeUserId = 'user-a';
const AsyncStorage = {
  async getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  async setItem(key, value) { memory.set(key, value); },
  async removeItem(key) { memory.delete(key); },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return { __esModule: true, default: AsyncStorage };
  if (request === './auth') return { getCurrentAuthUserId: async () => activeUserId };
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText, filename);
};
require.extensions['.tsx'] = require.extensions['.ts'];

const storage = require('../src/services/wordStorage.ts');

const word = {
  id: 'account-a-word',
  word: 'Account A',
  normalized_word: 'account a',
  first_letter: 'A',
  meaning_short: 'a test word',
  definitions: [],
  examples: [],
  synonyms: [],
  antonyms: [],
  updated_at: '2026-01-01T00:00:00.000Z',
};

(async () => {
  await storage.persistWordEntries([word]);
  memory.set(storage.getStorageRecoveryKey('words', 'user-a'), 'private recovery data');
  await storage.recordDeletedWord('user-a', 'old-word');
  await storage.markCloudCollectionCleared(storage.cloudStorageKeys.clearedWords, 'user-a');
  await storage.markCloudCollectionCleared(storage.cloudStorageKeys.clearedReviews, 'user-a');

  await storage.clearLocalDataForUser('user-a');
  assert.equal(memory.has(storage.getStorageRecoveryKey('words', 'user-a')), false);

  assert.deepEqual(await storage.loadWordEntries(), []);
  assert.deepEqual(await storage.loadDeletedWordTombstones(), []);
  assert.deepEqual(await storage.loadClearedCollections(storage.cloudStorageKeys.clearedWords), {});
  assert.deepEqual(await storage.loadClearedCollections(storage.cloudStorageKeys.clearedReviews), {});

  const auth = fs.readFileSync('src/services/auth.ts', 'utf8');
  const context = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  const accountCard = fs.readFileSync('src/components/AccountCard.tsx', 'utf8');
  const storageSource = fs.readFileSync('src/services/wordStorage.ts', 'utf8');
  const edgeFunction = fs.readFileSync('supabase/functions/delete-account/index.ts', 'utf8');
  const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
  const privacy = fs.readFileSync('PRIVACY.md', 'utf8');
  const supabaseReadme = fs.readFileSync('supabase/README.md', 'utf8');
  const workflow = fs.readFileSync('.github/workflows/quality.yml', 'utf8');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const phaseDoc = fs.readFileSync('PHASE_18_ACCOUNT_DELETION.md', 'utf8');

  assert.match(auth, /functions\.invoke\('delete-account'/);
  assert.match(auth, /signOut\(\{ scope \}\)/);
  assert.doesNotMatch(auth, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(context, /clearLocalDataForUser/);
  assert.match(context, /signOut\('local'\)/);
  assert.match(accountCard, /Delete account/);
  assert.match(storageSource, /clearLocalDataForUser/);
  assert.match(edgeFunction, /auth\.getUser/);
  assert.match(edgeFunction, /auth\.admin\.deleteUser/);
  assert.match(edgeFunction, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(schema, /profiles[\s\S]*?on delete cascade/i);
  assert.match(schema, /word_entries[\s\S]*?on delete cascade/i);
  assert.match(schema, /review_submissions[\s\S]*?on delete cascade/i);
  assert.deepEqual(tsconfig.exclude, ['supabase/functions']);
  assert.match(privacy, /Delete account/);
  assert.match(supabaseReadme, /supabase functions deploy delete-account/);
  assert.equal(packageJson.scripts['test:phase18'], 'node scripts/test-phase18.js');
  assert.match(workflow, /npm run test:phase18/);
  assert.match(phaseDoc, /service-role/i);

  console.log('Phase 18 account-deletion checks passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
