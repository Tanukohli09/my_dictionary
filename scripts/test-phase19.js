const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const appConfig = JSON.parse(read('app.json')).expo;
const easConfig = JSON.parse(read('eas.json'));
const packageJson = JSON.parse(read('package.json'));
const android = appConfig.android;
const production = easConfig.build?.production;
const phaseDoc = read('PHASE_19_ANDROID_PLAY_RELEASE.md');
const privacy = read('PRIVACY.md');
const support = read('SUPPORT.md');
const workflow = read('.github/workflows/quality.yml');

assert.equal(appConfig.name, 'My Dictionary');
assert.equal(appConfig.slug, 'my-dictionary');
assert.equal(appConfig.scheme, 'mydictionary');
assert.equal(android.package, 'com.tanukohli.mydictionary');
assert.equal(android.versionCode, 1);
assert.deepEqual(android.permissions, [], 'the app must not silently request extra Android permissions');
assert.ok(appConfig.plugins.includes('./plugins/withSecureAndroid.js'));
const { secureManifest } = require('../plugins/withSecureAndroid');
const manifest = secureManifest({ manifest: { application: [{ $: { 'android:label': 'Dictionary', 'android:usesCleartextTraffic': 'true' } }] } });
assert.equal(manifest.manifest.application[0].$['android:usesCleartextTraffic'], 'false');
assert.equal(manifest.manifest.application[0].$['android:label'], 'Dictionary');
assert.ok(exists(appConfig.icon), 'the production launcher icon must exist');
assert.ok(exists(android.adaptiveIcon.foregroundImage), 'the adaptive icon foreground must exist');
assert.ok(production?.autoIncrement, 'production builds must auto-increment version codes');
assert.equal(production?.android?.buildType, 'app-bundle');
assert.equal(packageJson.scripts['test:phase19'], 'node scripts/test-phase19.js');
assert.match(phaseDoc, /Play Console/i);
assert.match(phaseDoc, /data safety/i);
assert.match(phaseDoc, /com\.tanukohli\.mydictionary/);
assert.match(phaseDoc, /delete-account/);
assert.match(privacy, /Delete account/i);
assert.match(support, /account-deletion/i);
assert.match(workflow, /npm run test:phase19/);

console.log('Phase 19 Android Play Store release checks passed.');
