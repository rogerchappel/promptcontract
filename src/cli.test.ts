import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
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

test('check exits nonzero with parseable JSON when one matched file has malformed YAML', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-cli-yaml-'));
  await writeFile(path.join(workspace, 'bad.md'), '---\nname: [unterminated\n---\nBroken prompt.\n');
  const result = spawnSync(process.execPath, [cliPath, 'check', '*.md', '--report', 'json'], {
    cwd: workspace,
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stderr, '');

  const report = JSON.parse(result.stdout) as {
    ok: boolean;
    checked: number;
    codes: Record<string, number>;
    files: Array<{ path: string; findings: Array<{ code: string }> }>;
  };
  assert.equal(report.ok, false);
  assert.equal(report.checked, 1);
  assert.equal(report.codes['invalid-frontmatter-yaml'], 1);
  assert.equal(report.files[0]?.path, 'bad.md');
  assert.equal(report.files[0]?.findings[0]?.code, 'invalid-frontmatter-yaml');
});

test('check accepts examples that omit or supply an optional placeholder', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-cli-optional-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: optional-audience
version: 1.0.0
inputs:
  - name: audience
    required: false
outputs:
  - format: markdown
risks:
  - Do not invent facts.
examples:
  - name: omitted
    inputs: {}
  - name: supplied
    inputs:
      audience: maintainers
---
Write for {{audience}}.
`);
  const result = spawnSync(process.execPath, [cliPath, 'check', '*.md', '--report', 'json'], {
    cwd: workspace,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');

  const report = JSON.parse(result.stdout) as {
    ok: boolean;
    errors: number;
    codes: Record<string, number>;
  };
  assert.equal(report.ok, true);
  assert.equal(report.errors, 0);
  assert.equal(report.codes['example-missing-input'], undefined);
});

test('check exits nonzero and preserves schema finding paths in Markdown and JSON', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-cli-schema-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: invalid-required
version: 1.0.0
inputs:
  - name: audience
    required: "false"
outputs:
  - format: markdown
risks:
  - Do not invent facts.
examples:
  - name: invalid input
    inputs:
      audience: maintainers
      surprise: ignored
---
Write for {{audience}}.
`);

  const jsonResult = spawnSync(process.execPath, [cliPath, 'check', '*.md', '--report', 'json'], {
    cwd: workspace,
    encoding: 'utf8'
  });
  const markdownResult = spawnSync(process.execPath, [cliPath, 'check', '*.md'], {
    cwd: workspace,
    encoding: 'utf8'
  });

  assert.equal(jsonResult.status, 1);
  assert.equal(markdownResult.status, 1);
  const report = JSON.parse(jsonResult.stdout) as {
    files: Array<{ findings: Array<{ code: string; field?: string }> }>;
  };
  assert.deepEqual(report.files[0]?.findings.map(({ code, field }) => ({ code, field })), [
    { code: 'invalid-input-required', field: 'inputs[0].required' },
    { code: 'undeclared-example-input', field: 'examples[0].inputs.surprise' }
  ]);
  assert.match(markdownResult.stdout, /invalid-input-required \(inputs\[0\]\.required\)/);
  assert.match(markdownResult.stdout, /undeclared-example-input \(examples\[0\]\.inputs\.surprise\)/);
});
