const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = readJson('app.json').expo;
const eas = readJson('eas.json');
const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
const phaseDoc = fs.readFileSync(path.join(root, 'PHASE_12_ACCOUNT_AND_ANDROID_FOUNDATION.md'), 'utf8');

assert(app.scheme === 'mydictionary', 'app.json must define the mydictionary auth scheme');
assert(app.android?.package === 'com.tanukohli.mydictionary', 'app.json must define the final Android package ID');
assert(app.android?.versionCode === 1, 'app.json must start Android versionCode at 1');
assert(eas.build?.development?.developmentClient === true, 'eas.json must define a development client profile');
assert(eas.build?.preview?.distribution === 'internal', 'eas.json must define an internal preview profile');
assert(eas.build?.production?.autoIncrement === true, 'eas.json must enable production version auto-increment');
assert(envExample.includes('EXPO_PUBLIC_SUPABASE_URL'), '.env.example must document the Supabase URL');
assert(envExample.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY'), '.env.example must document the Supabase client key');
assert(phaseDoc.includes('Authentication provider: Supabase Auth.'), 'Phase 12 must record the approved authentication decision');
assert(phaseDoc.includes('User-data database: Supabase Postgres.'), 'Phase 12 must record the approved database decision');
assert(phaseDoc.includes('com.tanukohli.mydictionary'), 'Phase 12 must record the approved Android package ID');

console.log('Phase 12 foundation checks passed.');
