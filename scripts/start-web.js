const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const expoCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const expoArgs = ['expo', 'start', '--web', ...process.argv.slice(2)];
const localApiEnv = {
  ...process.env,
  // Keep the development proxy aligned with dictionaryApi.ts even when a production PORT is in .env.
  PORT: process.env.DICTIONARY_DEV_API_PORT || process.env.DICTIONARY_PROXY_PORT || '3001',
};

const api = spawn(process.execPath, [path.join(root, 'server', 'dictionaryProxy.js')], {
  cwd: root,
  env: localApiEnv,
  stdio: 'inherit',
});
const expo = spawn(expoCommand, expoArgs, {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  api.kill('SIGTERM');
  expo.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250);
}

expo.on('exit', (code) => shutdown(code || 0));
api.on('exit', (code) => {
  if (code && !shuttingDown) console.error('[dictionary-api] stopped unexpectedly');
});
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
