const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 10_000;
    const retry = () => {
      if (Date.now() >= deadline) reject(new Error('E2E release server did not become ready.'));
      else setTimeout(check, 100);
    };
    const check = () => {
      const request = http.get(`http://127.0.0.1:${port}/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) resolve();
        else retry();
      });
      request.on('error', retry);
    };
    check();
  });
}

function waitForExit(child) {
  return new Promise((resolve) => child.once('exit', (code) => resolve(code)));
}

async function main() {
  const portServer = http.createServer();
  const port = await listen(portServer);
  await new Promise((resolve) => portServer.close(resolve));

  const server = spawn(process.execPath, [path.join(root, 'scripts', 'start-e2e.js'), '--port', String(port)], {
    cwd: root,
    stdio: 'inherit',
  });

  try {
    await waitForServer(port);
    const smoke = spawnSync(process.execPath, [path.join(root, 'scripts', 'release-smoke.js')], {
      cwd: root,
      env: {
        ...process.env,
        RELEASE_BASE_URL: `http://127.0.0.1:${port}`,
        RELEASE_WEB_ORIGIN: `http://127.0.0.1:${port}`,
        RELEASE_SMOKE_WORD: 'owl',
      },
      encoding: 'utf8',
    });
    assert.equal(smoke.status, 0, `${smoke.stdout}\n${smoke.stderr}`);
    process.stdout.write(smoke.stdout);
  } finally {
    server.kill('SIGTERM');
    await waitForExit(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
