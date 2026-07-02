const assert = require('assert/strict');
const fs = require('fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText, filename);
};

const {
  answerReviewSessionQuestion,
  buildReviewQuestion,
  completeReviewSession,
  createReviewSession,
  isReviewSessionComplete,
} = require('../src/modules/reviewSession.ts');

function word(word, meaning_short, overrides = {}) {
  return {
    id: word,
    word,
    normalized_word: word.toLowerCase(),
    first_letter: word[0].toUpperCase(),
    phonetic: null,
    audio_url: null,
    part_of_speech: null,
    meaning_short,
    definitions: [],
    example: null,
    examples: [],
    synonyms: [],
    antonyms: [],
    my_meaning: null,
    personal_note: null,
    is_favorite: false,
    search_count: 0,
    reviewed_count: 0,
    correct_count: 0,
    mastery_level: 0,
    source: 'test',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    last_searched_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function randomSequence(values) {
  let index = 0;
  return () => values[index++] ?? 0.99;
}

function steadyRandom() {
  let index = 0;
  return () => ((index++ % 97) + 1) / 100;
}

(function rejectsQuestionWhenThereAreNotFourDistinctMeanings() {
  const question = buildReviewQuestion([
    word('Alpha', 'same meaning'),
    word('Beta', 'same meaning'),
    word('Gamma', 'third meaning'),
    word('Delta', 'fourth meaning'),
  ]);

  assert.equal(question, null);
})();

(function buildsUnambiguousOptionsWhenWordsShareAMeaning() {
  const question = buildReviewQuestion([
    word('Alpha', 'same meaning'),
    word('Beta', 'same meaning'),
    word('Gamma', 'third meaning'),
    word('Delta', 'fourth meaning'),
    word('Epsilon', 'fifth meaning'),
  ], randomSequence([0, 0.1, 0.2, 0.3, 0.4, 0, 0.1, 0.2, 0.3]));

  assert.ok(question);
  assert.equal(question.word.word, 'Alpha');
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.equal(question.options.filter((option) => option === question.word.meaning_short).length, 1);
  assert.equal(question.options[question.correctIndex], question.word.meaning_short);
})();

(function prefersLearnersCustomMeaningWhenPresent() {
  const question = buildReviewQuestion([
    word('Resilient', 'able to recover', { my_meaning: 'becomes strong again after problems' }),
    word('Curious', 'eager to learn'),
    word('Benevolent', 'kind and helpful'),
    word('Accurate', 'correct and exact'),
  ], randomSequence([0, 0.1, 0.2, 0.3, 0, 0.1, 0.2, 0.3]));

  assert.ok(question);
  assert.equal(question.options[question.correctIndex], 'becomes strong again after problems');
})();

(function reviewSessionDoesNotRepeatWordsWhenEnoughUniqueWordsExist() {
  const words = Array.from({ length: 12 }, (_, index) => word(`Word${index + 1}`, `meaning ${index + 1}`));
  const session = createReviewSession(words, { id: 'no-repeat', totalQuestions: 10, random: steadyRandom(), now: () => '2026-01-01T00:00:00.000Z' });

  assert.ok(session);
  const askedWordIds = session.questions.map((question) => question.word.id);
  assert.equal(askedWordIds.length, 10);
  assert.equal(new Set(askedWordIds).size, 10, `expected no repeated words, got ${askedWordIds.join(', ')}`);
})();

(function reviewSessionCyclesOnlyAfterAllAvailableWordsAreAsked() {
  const words = Array.from({ length: 6 }, (_, index) => word(`Word${index + 1}`, `meaning ${index + 1}`));
  const session = createReviewSession(words, { id: 'cycle-after-all', totalQuestions: 10, random: steadyRandom(), now: () => '2026-01-01T00:00:00.000Z' });

  assert.ok(session);
  const askedWordIds = session.questions.map((question) => question.word.id);
  assert.equal(new Set(askedWordIds.slice(0, 6)).size, 6, `first cycle should ask all words once: ${askedWordIds.join(', ')}`);
  assert.equal(new Set(askedWordIds.slice(6)).size, 4, `second cycle should not repeat until it has to: ${askedWordIds.join(', ')}`);
})();

(function completedSessionBuildsReviewSubmissionForHistory() {
  const words = Array.from({ length: 4 }, (_, index) => word(`Word${index + 1}`, `meaning ${index + 1}`));
  let session = createReviewSession(words, { id: 'history-session', totalQuestions: 4, random: steadyRandom(), now: () => '2026-01-01T00:00:00.000Z' });

  assert.ok(session);
  for (let index = 0; index < session.totalQuestions; index++) {
    const answered = answerReviewSessionQuestion(session, session.questions[index].correctIndex, () => `2026-01-01T00:00:0${index}.000Z`);
    session = { ...answered.session, currentIndex: Math.min(index + 1, session.totalQuestions - 1) };
  }

  assert.equal(isReviewSessionComplete(session), true);
  const submission = completeReviewSession(session, '2026-01-01T00:01:00.000Z');
  assert.ok(submission);
  assert.equal(submission.session_id, 'history-session');
  assert.equal(submission.total_questions, 4);
  assert.equal(submission.correct_answers, 4);
  assert.equal(submission.questions.length, 4);
  assert.equal(submission.reviewed_words.length, 4);
  assert.ok(submission.questions.every((question) => question.selected_answer === question.correct_answer));
})();

console.log('reviewSession tests passed');
