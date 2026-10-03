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
    source: 'api',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    last_searched_at: '2025-01-01T00:00:00.000Z',
  };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(({ storageKey, onboardedKey, words }) => {
    window.localStorage.clear();
    window.localStorage.setItem(onboardedKey, 'yes');
    window.localStorage.setItem(storageKey, JSON.stringify(words));
  }, { storageKey: STORAGE_KEY, onboardedKey: ONBOARDED_KEY, words: [makeWord('Flower', 'a colourful plant structure')] });
});

test('desktop word detail my meaning edit opens note editor', async ({ page }) => {
  await page.goto('/?screen=dictionary', { waitUntil: 'networkidle' });

  await page.getByText('Flower').first().click();
  await expect(page.getByText('My meaning')).toBeVisible();

  await page.getByRole('button', { name: 'Edit my meaning' }).click();
  await expect(page.getByText('My Meaning')).toBeVisible();
});

test('desktop note editor saves text back to my meaning', async ({ page }) => {
  await page.goto('/?screen=detail', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Edit my meaning' }).click();
  await page.getByPlaceholder('Write your own simple meaning...').fill('A blossom I want to remember.');
  await page.getByRole('button', { name: 'Save my meaning' }).click();

  await expect(page.getByText('My meaning')).toBeVisible();
  await expect(page.getByText('A blossom I want to remember.')).toBeVisible();
  await expect.poll(async () => page.evaluate((storageKey) => {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    return saved[0]?.my_meaning;
  }, STORAGE_KEY)).toBe('A blossom I want to remember.');
});

test('failed note save preserves text and allows retry', async ({ page }) => {
  await page.goto('/?screen=detail', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Edit my meaning' }).click();
  const input = page.getByRole('textbox', { name: 'Your personal meaning' });
  await input.fill('Keep this draft');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'my-dictionary.words.v1') {
        Storage.prototype.setItem = original;
        throw new Error('Simulated full storage');
      }
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Save my meaning' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(input).toHaveValue('Keep this draft');
  await page.getByRole('button', { name: 'Save my meaning' }).click();
  await expect(page.getByText('My meaning', { exact: true })).toBeVisible();
});
