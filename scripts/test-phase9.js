const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const packageJson = JSON.parse(read('package.json'));
const workflow = read('.github/workflows/production-monitor.yml');

assert.equal(packageJson.scripts['test:phase9'], 'node scripts/test-phase9.js');
assert.equal(packageJson.scripts['monitor:smoke'], 'node scripts/hosted-monitor.js');
assert.match(workflow, /cron: '.*\/15 \* \* \* \*'/);
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /BETA_BASE_URL: https:\/\/my-dictionary-staging\.onrender\.com/);
assert.match(workflow, /BETA_EXPECTED_PROVIDER: datamuse/);
assert.match(workflow, /npm run monitor:smoke/);
assert.doesNotMatch(workflow, /BETA_METRICS_TOKEN/);
assert.match(read('scripts/hosted-monitor.js'), /MONITOR_ATTEMPTS/);
assert.match(read('scripts/hosted-monitor.js'), /MONITOR_RETRY_DELAY_MS/);
assert.match(read('README.md'), /production-monitor\.yml/);
assert.match(read('BETA_RUNBOOK.md'), /GitHub Actions hosted-service monitor/);

console.log('Phase 9 launch-gate checks passed.');
