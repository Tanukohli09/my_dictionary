const fs = require('fs');
const assert = require('assert/strict');

const source = fs.readFileSync('src/components/OwlMascot.tsx', 'utf8');

assert.match(source, /useTheme/, 'OwlMascot should read the current theme');
assert.match(source, /isNightMode/, 'OwlMascot should apply a night-mode-specific finish');
assert.match(source, /owl-dark-finish/, 'OwlMascot should expose the dark finish layer for regression checks');

console.log('owl mascot dark finish test passed');
