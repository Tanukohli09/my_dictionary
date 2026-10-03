const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

const memory = new Map();
let activeUserId = null;
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

const wordStorage = require('../src/services/wordStorage.ts');

function word(id, value) {
  return {
    id,
    word: value,
    normalized_word: value.toLowerCase(),
    first_letter: value[0].toUpperCase(),
    meaning_short: `meaning of ${value}`,
    definitions: [],
    examples: [],
    synonyms: [],
    antonyms: [],
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

async function run() {
  const accountAWord = word('a-word', 'Account A');
  const accountBWord = word('b-word', 'Account B');

  await wordStorage.persistWordEntries([accountAWord]);
  activeUserId = 'user-a';
  assert.deepEqual(await wordStorage.loadWordEntries(), [accountAWord], 'first account should receive the anonymous local migration');
  await wordStorage.prepareLocalDataForSignOut('user-a');

  activeUserId = null;
  assert.deepEqual(await wordStorage.loadWordEntries(), [], 'signed-out users must not see the previous account cache');
  activeUserId = 'user-b';
  assert.deepEqual(await wordStorage.loadWordEntries(), [], 'second account must not inherit the first account cache');

  await wordStorage.persistWordEntries([accountBWord]);
  await wordStorage.prepareLocalDataForSignOut('user-b');
  activeUserId = 'user-a';
  assert.deepEqual(await wordStorage.loadWordEntries(), [accountAWord], 'first account data should remain recoverable');
  activeUserId = 'user-b';
  assert.deepEqual(await wordStorage.loadWordEntries(), [accountBWord], 'second account data should remain isolated');

  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const auth = fs.readFileSync('src/services/auth.ts', 'utf8');
  const authContext = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
  const navigator = fs.readFileSync('src/navigation/AppNavigator.tsx', 'utf8');
  const storage = fs.readFileSync('src/services/wordStorage.ts', 'utf8');
  const phaseDoc = fs.readFileSync('PHASE_16_ACCOUNT_ISOLATION_AND_STORE_IDENTITY.md', 'utf8');

  assert.equal(fs.existsSync('src/assets/app-icon.png'), true);
  assert.equal(fs.existsSync('src/assets/app-icon-foreground.png'), true);
  assert.equal(appJson.expo.icon, './src/assets/app-icon.png');
  assert.equal(appJson.expo.android.adaptiveIcon.foregroundImage, './src/assets/app-icon-foreground.png');
  assert.match(auth, /finally \{/);
  assert.match(auth, /clearWebCallbackUrl/);
  assert.match(authContext, /prepareLocalDataForSignOut/);
  assert.match(navigator, /previousSessionUserIdRef/);
  assert.match(navigator, /setWords\(\[\]\)/);
  assert.match(storage, /LOCAL_OWNER_KEY/);
  assert.match(storage, /userScopedKey/);
  assert.match(storage, /persistReviewSubmissions\(\[\]\)/);
  assert.match(phaseDoc, /same browser or phone/i);
  assert.match(phaseDoc, /Play Store/i);

  console.log('Phase 16 account-isolation and store-identity checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
