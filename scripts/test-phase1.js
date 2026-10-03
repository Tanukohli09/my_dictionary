const assert = require('assert/strict');
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

const storage = new Map();
const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === './auth') return { getCurrentAuthUserId: async () => null, supabase: null };
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: {
      async getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      async setItem(key, value) { storage.set(key, value); },
      async removeItem(key) { storage.delete(key); },
    } };
  }
  if (request === 'react-native') return { Platform: { OS: 'web' }, Share: { async share() {} } };
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
};

const { calculateCurrentStreak } = require('../src/utils/reviewStats.ts');

function submission(completed_at) {
  return { id: completed_at, completed_at };
}

const now = new Date('2026-09-27T12:00:00.000Z');
assert.equal(calculateCurrentStreak([submission('2026-09-27T08:00:00.000Z'), submission('2026-09-26T08:00:00.000Z'), submission('2026-09-25T08:00:00.000Z')], now), 3);
assert.equal(calculateCurrentStreak([submission('2026-09-26T08:00:00.000Z')], now), 1);
assert.equal(calculateCurrentStreak([submission('2026-09-24T08:00:00.000Z')], now), 0);

const storageSource = fs.readFileSync('src/services/wordStorage.ts', 'utf8');
assert.match(storageSource, /return raw === 'yes'/, 'new installations should not be treated as already onboarded');

const profileSource = fs.readFileSync('src/screens/ProfileScreen.tsx', 'utf8');
assert.doesNotMatch(profileSource, /demoMode/, 'profile must not display demo progress');
assert.doesNotMatch(profileSource, /value: '7 days'/, 'profile must calculate the current streak');

const searchSource = fs.readFileSync('src/screens/SearchScreen.tsx', 'utf8');
assert.doesNotMatch(searchSource, /\['Resilient', 'Curious', 'Benevolent'\]/, 'recent words must not be hardcoded demo rows');

(async () => {
  const { importLocalData, exportLocalData } = require('../src/services/localDataTransfer.ts');
  const backup = {
    format: 'my-dictionary-backup',
    version: 1,
    exported_at: '2026-09-27T00:00:00.000Z',
    words: [{
      id: 'word-1', word: 'Example', normalized_word: 'example', first_letter: 'E', phonetic: null, audio_url: null,
      part_of_speech: 'noun', meaning_short: 'a representative instance', definitions: [{ partOfSpeech: 'noun', definition: 'a representative instance' }],
      example: null, examples: [], synonyms: [], antonyms: [], my_meaning: null, personal_note: null, is_favorite: true,
      search_count: 1, reviewed_count: 0, correct_count: 0, mastery_level: 0, source: 'test',
      created_at: '2026-09-27T00:00:00.000Z', updated_at: '2026-09-27T00:00:00.000Z', last_searched_at: '2026-09-27T00:00:00.000Z',
    }],
    review_submissions: [],
  };
  const imported = await importLocalData(JSON.stringify(backup));
  assert.deepEqual(imported, { wordsImported: 1, reviewsImported: 0 });
  const exported = JSON.parse(await exportLocalData());
  assert.equal(exported.format, 'my-dictionary-backup');
  assert.equal(exported.words[0].normalized_word, 'example');
  console.log('phase 1 tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
