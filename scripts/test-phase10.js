const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const security = read('SECURITY.md');
const support = read('SUPPORT.md');

assert.equal(packageJson.scripts['test:phase10'], 'node scripts/test-phase10.js');
assert.match(security, /private vulnerability reporting is enabled/i);
assert.doesNotMatch(security, /should enable GitHub private vulnerability reporting/i);
assert.match(support, /private GitHub security reporting channel/i);

console.log('Phase 10 final acceptance checks passed.');
