const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const betaPacket = read('CONTROLLED_BETA.md');
const runbook = read('BETA_RUNBOOK.md');

assert.equal(packageJson.scripts['test:phase11'], 'node scripts/test-phase11.js');
assert.match(betaPacket, /https:\/\/my-dictionary-staging\.onrender\.com/);
assert.match(betaPacket, /local-first/i);
assert.match(betaPacket, /Do not include private notes/i);
assert.match(betaPacket, /Export a backup/i);
assert.match(betaPacket, /private security reporting channel/i);
assert.match(betaPacket, /Suggested invitation text/);
assert.match(runbook, /\/ready/);
assert.match(runbook, /Rollback/);

console.log('Phase 11 controlled beta checks passed.');
