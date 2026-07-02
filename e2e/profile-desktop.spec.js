const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'my-dictionary.words.v1';
const ONBOARDED_KEY = 'my-dictionary.onboarded.v1';

function makeWord(word, meaning, overrides = {}) {
  const normalized = word.toLowerCase();
  return {
    id: `profile-${normalized}`,
    word,
    normalized_word: normalized,
    first_letter: word[0],
    phonetic: null,
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
    source: 'api',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    last_searched_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const words = [
  makeWord('Delta', 'fourth meaning', { reviewed_count: 2, is_favorite: true }),
  makeWord('Flower', 'a colourful plant structure', { reviewed_count: 3 }),
  makeWord('Iris', 'a flower', { reviewed_count: 1, is_favorite: true }),
  makeWord('Orchid', 'another flower'),
  makeWord('Willow', 'a tree'),
];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(({ storageKey, onboardedKey, words }) => {
    window.localStorage.clear();
    window.localStorage.setItem(onboardedKey, 'yes');
    window.localStorage.setItem(storageKey, JSON.stringify(words));
  }, { storageKey: STORAGE_KEY, onboardedKey: ONBOARDED_KEY, words });
});

test('desktop profile header leaf opens review practice', async ({ page }) => {
  await page.goto('/?screen=profile', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'My Progress' })).toBeVisible();
  await page.getByRole('button', { name: 'Open review practice' }).click();

  await expect(page).toHaveURL(/screen=review/);
});

test('desktop profile action cards navigate to useful sections', async ({ page }) => {
  await page.goto('/?screen=profile', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Open dictionary from total words' }).click();
  await expect(page).toHaveURL(/screen=dictionary/);

  await page.goto('/?screen=profile', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open review from reviewed words' }).click();
  await expect(page).toHaveURL(/screen=review/);
});
