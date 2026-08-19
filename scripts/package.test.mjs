import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { verifyPackedFiles } from './verify-pack.mjs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const requiredPaths = [
  'dist/cli.js',
  'dist/index.js',
  'fixtures/pass/release-note.md',
  'fixtures/fail/missing-risk.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
];

test('standalone npm test builds compiled tests before running them', () => {
  assert.match(packageJson.scripts.test, /^npm run build && /);
});

test('package smoke executes the package manifest verifier', () => {
  assert.match(packageJson.scripts['package:smoke'], /node scripts\/verify-pack\.mjs/);
});

test('package manifest verifier accepts the intended runtime files', () => {
  const result = verifyPackedFiles(requiredPaths.map((path) => ({ path })));
  assert.deepEqual(result.errors, []);
});

test('package manifest verifier rejects a missing runtime file', () => {
  const files = requiredPaths.filter((path) => path !== 'dist/cli.js').map((path) => ({ path }));
  assert.deepEqual(verifyPackedFiles(files).errors, ['Missing required package files: dist/cli.js']);
});

test('package manifest verifier rejects compiled test artifacts', () => {
  const files = [...requiredPaths, 'dist/cli.test.js', 'dist/index.test.d.ts', 'dist/index.test.js.map']
    .map((path) => ({ path }));
  assert.deepEqual(verifyPackedFiles(files).errors, [
    'Packaged compiled test artifacts: dist/cli.test.js, dist/index.test.d.ts, dist/index.test.js.map',
  ]);
});
