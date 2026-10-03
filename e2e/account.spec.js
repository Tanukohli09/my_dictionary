const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'my-dictionary.words.v1';
const ONBOARDED_KEY = 'my-dictionary.onboarded.v1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ storageKey, onboardedKey }) => {
    window.localStorage.clear();
    window.localStorage.setItem(onboardedKey, 'yes');
    window.localStorage.setItem(storageKey, '[]');
  }, { storageKey: STORAGE_KEY, onboardedKey: ONBOARDED_KEY });
});

test('profile exposes a safe account boundary without blocking local use', async ({ page }) => {
  await page.goto('/?screen=profile', { waitUntil: 'networkidle' });

  await expect(page.getByText('Account', { exact: true })).toBeVisible();

  const authConfigured = Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (authConfigured) {
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  } else {
    await expect(page.getByText('Local-first account access', { exact: true })).toBeVisible();
    await expect(page.getByText(/Google sign-in will appear when authentication is configured/i)).toBeVisible();
  }
});
