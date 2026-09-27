const STORAGE_KEY = 'my-dictionary.words.v1';
const REVIEW_KEY = 'my-dictionary.review-submissions.v1';
const ONBOARDED_KEY = 'my-dictionary.onboarded.v1';

function makeWord(word, meaning, overrides = {}) {
  const normalized = word.toLowerCase();
  return {
    id: `e2e-${normalized}`,
    word,
    normalized_word: normalized,
    first_letter: word[0],
    phonetic: '/test/',
    audio_url: null,
    part_of_speech: 'noun',
    meaning_short: meaning,
    definitions: [{ partOfSpeech: 'noun', definition: meaning, example: `${word} example`, synonyms: [] }],
    example: `${word} example`,
    examples: [`${word} example`],
    synonyms: [],
    antonyms: [],
    my_meaning: null,
    personal_note: null,
    is_favorite: false,
    search_count: 1,
    reviewed_count: 0,
    correct_count: 0,
    mastery_level: 0,
    source: 'e2e',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    last_searched_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

async function seedStorage(page, words = [], reviews = []) {
  await page.addInitScript(({ words: seededWords, reviews: seededReviews }) => {
    window.localStorage.clear();
    window.localStorage.setItem('my-dictionary.onboarded.v1', 'yes');
    window.localStorage.setItem('my-dictionary.words.v1', JSON.stringify(seededWords));
    window.localStorage.setItem('my-dictionary.review-submissions.v1', JSON.stringify(seededReviews));
  }, { words, reviews });
}

module.exports = { ONBOARDED_KEY, REVIEW_KEY, STORAGE_KEY, makeWord, seedStorage };
