import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cliPath = fileURLToPath(new URL('./cli.js', import.meta.url));

test('check exits nonzero and emits a failed JSON report when no files match', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-cli-empty-'));
  const result = spawnSync(process.execPath, [cliPath, 'check', 'missing/**/*.md', '--report', 'json'], {
    cwd: workspace,
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stderr, '');

  const report = JSON.parse(result.stdout) as {
    ok: boolean;
    checked: number;
    diagnostics: Array<{ code: string }>;
  };
  assert.equal(report.ok, false);
  assert.equal(report.checked, 0);
  assert.equal(report.diagnostics[0]?.code, 'no-files-matched');
});
