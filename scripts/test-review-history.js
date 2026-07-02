const assert = require('assert/strict');
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

const memory = new Map();
const AsyncStorage = {
  async getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  async setItem(key, value) { memory.set(key, value); },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return { default: AsyncStorage };
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText, filename);
};
require.extensions['.tsx'] = require.extensions['.ts'];

const { loadReviewSubmissions, saveReviewSubmission } = require('../src/services/wordStorage.ts');

function submission(id, completed_at) {
  return {
    id,
    session_id: id,
    started_at: '2026-01-01T00:00:00.000Z',
    completed_at,
    total_questions: 10,
    correct_answers: 7,
    reviewed_words: [{ id: 'w1', word: 'resilient' }],
    questions: [{
      word_id: 'w1',
      word: 'resilient',
      prompt: 'resilient',
      correct_answer: 'able to recover',
      options: ['able to recover', 'kind', 'exact', 'eager'],
      selected_index: 0,
      selected_answer: 'able to recover',
      correct_index: 0,
      correct: true,
      answered_at: '2026-01-01T00:00:05.000Z',
    }],
  };
}

(async () => {
  await saveReviewSubmission(submission('older', '2026-01-01T00:01:00.000Z'));
  await saveReviewSubmission(submission('newer', '2026-01-02T00:01:00.000Z'));

  const loaded = await loadReviewSubmissions();
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].id, 'newer');
  assert.equal(loaded[1].id, 'older');
  assert.equal(loaded[0].questions[0].selected_answer, 'able to recover');

  const reviewScreenSource = fs.readFileSync('src/screens/ReviewScreen.tsx', 'utf8');
  assert.match(reviewScreenSource, /loadReviewSubmissions/, 'ReviewScreen should load saved review submissions');
  assert.match(reviewScreenSource, /Previous reviews/, 'ReviewScreen should display a review history section');
  assert.match(reviewScreenSource, /review-history-item/, 'ReviewScreen should render saved review submissions as history items');

  console.log('review history tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
