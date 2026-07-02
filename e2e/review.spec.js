const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'my-dictionary.words.v1';
const ONBOARDED_KEY = 'my-dictionary.onboarded.v1';

function makeWord(word, meaning) {
  const normalized = word.toLowerCase();
  return {
    id: `test-${normalized}`,
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
  };
}

const words = [
  makeWord('Alpha', 'first meaning'),
  makeWord('Bravo', 'second meaning'),
  makeWord('Charlie', 'third meaning'),
  makeWord('Delta', 'fourth meaning'),
];

test('keeps the same review word after answer selection until Next is pressed', async ({ page }) => {
  await page.addInitScript(({ words, storageKey, onboardedKey }) => {
    window.localStorage.clear();
    window.localStorage.setItem(onboardedKey, 'yes');
    window.localStorage.setItem(storageKey, JSON.stringify(words));
  }, { words, storageKey: STORAGE_KEY, onboardedKey: ONBOARDED_KEY });

  await page.goto('/?screen=review', { waitUntil: 'networkidle' });
  await expect(page.getByText(/What does/)).toBeVisible();

  const initialBodyText = await page.locator('body').innerText();
  const initialWord = initialBodyText.match(/What does\s+“([^”]+)” mean/)?.[1];
  expect(initialWord).toBeTruthy();

  const nextWordIndex = words.findIndex((word) => word.word !== initialWord);
  await page.evaluate(({ nextWordIndex }) => {
    const ranks = [0.2, 0.2, 0.2, 0.2];
    ranks[nextWordIndex] = 0.01;
    const randomValues = [...ranks, 0.1, 0.2, 0.3, 0.4];
    let index = 0;
    Math.random = () => randomValues[index++] ?? 0.5;
  }, { nextWordIndex });

  await page.getByText(/^A\)/).click();
  await expect(page.getByText('Next')).toBeVisible();
  await page.waitForFunction(([storageKey, initialWord]) => {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return saved.some((word) => word.word === initialWord && word.reviewed_count === 1);
  }, [STORAGE_KEY, initialWord]);

  await expect(page.getByText(`“${initialWord}”`)).toBeVisible();
});
