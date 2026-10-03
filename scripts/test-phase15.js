const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const appJson = JSON.parse(read('app.json'));
const easJson = JSON.parse(read('eas.json'));
const accountSpec = read('e2e/account.spec.js');
const phaseDoc = read('PHASE_15_AUTH_AND_ANDROID_VALIDATION.md');

assert.equal(packageJson.scripts['test:phase15'], 'node scripts/test-phase15.js');
assert.equal(appJson.expo.scheme, 'mydictionary');
assert.equal(appJson.expo.android.package, 'com.tanukohli.mydictionary');
assert.equal(appJson.expo.android.versionCode, 1);
assert.ok(appJson.expo.plugins.includes('expo-web-browser'));
assert.ok(appJson.expo.plugins.includes('expo-secure-store'));

assert.equal(easJson.cli.appVersionSource, 'remote');
assert.equal(easJson.build.development.developmentClient, true);
assert.equal(easJson.build.development.distribution, 'internal');
assert.equal(easJson.build.preview.distribution, 'internal');
assert.equal(easJson.build.production.autoIncrement, true);
assert.equal(easJson.build.production.android.buildType, 'app-bundle');
assert.ok(easJson.submit.production);

assert.match(accountSpec, /Local-first account access/);
assert.match(accountSpec, /Continue with Google/);
assert.match(accountSpec, /EXPO_PUBLIC_SUPABASE_URL/);
assert.match(phaseDoc, /two-account isolation/i);
assert.match(phaseDoc, /npx eas build --platform android --profile preview/);
assert.match(phaseDoc, /npx eas build --platform android --profile production/);
assert.match(phaseDoc, /icon/i);
assert.match(phaseDoc, /service-role/i);

console.log('Phase 15 authentication and Android release checks passed.');
