const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const appJson = JSON.parse(read('app.json'));
const authService = read('src/services/auth.ts');
const dockerfile = read('Dockerfile');
const authContext = read('src/context/AuthContext.tsx');
const accountCard = read('src/components/AccountCard.tsx');
const privacy = read('PRIVACY.md');
const infoScreen = read('src/screens/InfoScreen.tsx');

assert.equal(packageJson.scripts['test:phase13'], 'node scripts/test-phase13.js');
assert.match(packageJson.dependencies['@supabase/supabase-js'], /^\^2\./);
assert.match(packageJson.dependencies['expo-auth-session'], /^~57\./);
assert.match(packageJson.dependencies['expo-secure-store'], /^~57\./);
assert.match(packageJson.dependencies['expo-web-browser'], /^~57\./);
assert.equal(appJson.expo.scheme, 'mydictionary');
assert.match(authService, /flowType: 'pkce'/);
assert.match(authService, /signInWithOAuth/);
assert.match(authService, /exchangeCodeForSession/);
assert.match(authService, /SecureStore/);
assert.match(authService, /EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'/);
assert.match(authService, /GOOGLE_AUTH_ENABLED && SUPABASE_URL && SUPABASE_ANON_KEY/);
assert.equal((dockerfile.match(/FROM node:22-bookworm-slim/g) || []).length, 2);
assert.match(dockerfile, /ARG EXPO_PUBLIC_SUPABASE_URL/);
assert.match(dockerfile, /ARG EXPO_PUBLIC_SUPABASE_ANON_KEY/);
assert.match(dockerfile, /ARG EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=false/);
assert.match(authContext, /onAuthStateChange/);
assert.match(authContext, /startAutoRefresh/);
assert.match(accountCard, /Continue with Google/);
assert.match(accountCard, /Sign out/);
assert.match(privacy, /Optional Google sign-in/);
assert.match(infoScreen, /Optional Google sign-in/);
assert.doesNotMatch(authService, /service-role/i);

console.log('Phase 13 Google authentication checks passed.');
