const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));

assert.equal(packageJson.scripts['test:phase8'], 'node scripts/test-phase8.js');
assert.match(read('App.tsx'), /AppErrorBoundary/);
assert.match(read('src/components/AppErrorBoundary.tsx'), /accessibilityLabel="Try again"/);
assert.match(read('src/navigation/navigationFlow.ts'), /requestedWordFromUrl/);
assert.match(read('src/navigation/AppNavigator.tsx'), /addEventListener\('popstate'/);
assert.match(read('src/navigation/AppNavigator.tsx'), /history\.pushState/);
assert.match(read('e2e/navigation.spec.js'), /Back, Forward, and refresh/);

console.log('Phase 8 resilience and deep-link checks passed.');
