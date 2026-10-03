const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const schema = read('supabase/schema.sql');
const sync = read('src/services/cloudSync.ts');
const storage = read('src/services/wordStorage.ts');
const render = read('render.yaml');
const phaseDoc = read('PHASE_14_CLOUD_SYNC.md');

assert.equal(packageJson.scripts['test:phase14'], 'node scripts/test-phase14.js');
assert.match(schema, /alter table public\.word_entries enable row level security/i);
assert.match(schema, /auth\.uid\(\)\)\s*=\s*user_id/i);
assert.match(schema, /unique \(user_id, normalized_word\)/i);
assert.match(schema, /on_auth_user_created/i);
assert.match(sync, /onConflict: 'user_id,normalized_word'/);
assert.match(sync, /onConflict: 'user_id,id'/);
assert.match(sync, /deleteCloudWords/);
assert.match(sync, /persistWordEntries/);
assert.match(storage, /cloud-deleted-words/);
assert.match(storage, /cloud-cleared-reviews/);
assert.match(render, /EXPO_PUBLIC_SUPABASE_URL/);
assert.match(render, /EXPO_PUBLIC_SUPABASE_ANON_KEY/);
assert.match(phaseDoc, /Row Level Security/);
assert.match(phaseDoc, /offline deletes are not undone/i);

console.log('Phase 14 cloud sync checks passed.');
