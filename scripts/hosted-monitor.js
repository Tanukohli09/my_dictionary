const { spawn } = require('node:child_process');

const attempts = Math.max(1, Number(process.env.MONITOR_ATTEMPTS || 3));
const retryDelayMs = Math.max(0, Number(process.env.MONITOR_RETRY_DELAY_MS || 15_000));

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runSmoke() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/beta-smoke.js'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
    child.once('error', () => resolve(1));
    child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

async function main() {
  let exitCode = 1;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (attempt > 1) {
      console.log('Hosted service smoke retry ' + attempt + '/' + attempts + ' after a possible cold start.');
      await wait(retryDelayMs);
    }
    exitCode = await runSmoke();
    if (exitCode === 0) process.exit(0);
  }
  process.exit(exitCode);
}

main().catch((error) => {
  console.error('Hosted monitor failed: ' + error.message);
  process.exit(1);
});
