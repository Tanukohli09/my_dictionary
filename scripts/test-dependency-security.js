const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const xcodeRequire = createRequire(require.resolve('xcode'));
const uuid = xcodeRequire('uuid');
assert.equal(xcodeRequire('uuid/package.json').version, '11.1.1');
for (const fn of [uuid.v3, uuid.v5]) {
  assert.throws(() => fn('dictionary', uuid.v3.DNS, Buffer.alloc(15)), RangeError);
}
const project = require('xcode').project('dependency-test.pbxproj');
project.allUuids = () => [];
const ids = new Set(Array.from({ length: 100 }, () => project.generateUuid()));
assert.equal(ids.size, 100);
for (const id of ids) assert.match(id, /^[A-F0-9]{24}$/);
console.log('Dependency security: patched UUID buffer bounds and Xcode IDs passed.');
