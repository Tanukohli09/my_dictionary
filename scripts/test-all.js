// Run every checked-in Node test and the complete browser suite, retaining
// failures so one broken suite does not hide the results of later suites.
const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const tests = readdirSync(__dirname).filter(name => /^test-.*\.js$/.test(name) && name !== 'test-all.js').sort();
const results = [];
function run(name, command, args) {
  console.log(`\nRunning ${name}`);
  const result = spawnSync(command, args, { stdio: 'inherit', timeout: 300000 });
  results.push({ name, passed: result.status === 0 });
  if (result.error) console.error(result.error.message);
}
run('TypeScript', 'npm', ['run', 'typecheck']);
run('Web build', 'npm', ['run', 'build:web']);
for (const name of tests) run(name, process.execPath, [path.join('scripts', name)]);
run('All browser tests (including navigation)', 'npx', ['--no-install', 'playwright', 'test', '--workers=1']);
console.log('\nTest results:');
for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
process.exitCode = results.some(result => !result.passed) ? 1 : 0;
