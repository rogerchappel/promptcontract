import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const cwd = new URL('..', import.meta.url);
const isReleaseChild = process.env.PROMPTCONTRACT_RELEASE_REGRESSION_CHILD === '1';

function npmRun(script, env = {}) {
  return spawnSync('npm', ['run', script], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('smoke accepts a passing fixture and the expected failing fixture', { skip: isReleaseChild }, () => {
  const result = npmRun('smoke');
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('smoke rejects a missing passing fixture', { skip: isReleaseChild }, () => {
  const result = npmRun('smoke', {
    PROMPTCONTRACT_PASS_FIXTURE: 'fixtures/pass/does-not-exist.md',
  });
  assert.notEqual(result.status, 0, 'smoke unexpectedly accepted a missing passing fixture');
});

test('release:check propagates a broken passing fixture', { skip: isReleaseChild }, () => {
  const result = npmRun('release:check', {
    PROMPTCONTRACT_PASS_FIXTURE: 'fixtures/pass/does-not-exist.md',
    PROMPTCONTRACT_RELEASE_REGRESSION_CHILD: '1',
  });
  assert.notEqual(result.status, 0, 'release:check unexpectedly accepted a missing passing fixture');
  assert.match(result.stdout + result.stderr, /Passing fixture smoke check exited 1; expected 0\./);
});
