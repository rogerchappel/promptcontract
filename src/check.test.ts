import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { checkPrompts } from './check.js';

test('checkPrompts passes a complete prompt contract', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-pass-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: release-note
version: 1.0.0
inputs:
  - name: product
    required: true
outputs:
  - format: markdown
risks:
  - Do not invent shipped changes.
examples:
  - name: normal
    inputs:
      product: Widget CLI
---
Write a release note for {{product}}.
`);

  const report = await checkPrompts(['*.md'], { cwd: workspace });

  assert.equal(report.ok, true);
  assert.equal(report.checked, 1);
  assert.equal(report.errors, 0);
  assert.deepEqual(report.codes, {});
  assert.deepEqual(report.diagnostics, []);
});

test('checkPrompts fails with an actionable diagnostic when no files match', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-empty-'));

  const report = await checkPrompts(['missing/**/*.md'], { cwd: workspace });

  assert.equal(report.ok, false);
  assert.equal(report.checked, 0);
  assert.equal(report.errors, 1);
  assert.equal(report.codes['no-files-matched'], 1);
  assert.deepEqual(report.files, []);
  assert.deepEqual(report.diagnostics, [{
    severity: 'error',
    code: 'no-files-matched',
    message: 'No prompt files matched the provided patterns: missing/**/*.md',
    path: '.'
  }]);
});

test('checkPrompts reports undeclared placeholders and missing example inputs', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-fail-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: support-reply
version: 1.0.0
inputs:
  - name: customer
outputs:
  - format: markdown
risks:
  - Do not expose private account details.
examples:
  - name: missing ticket
    inputs:
      customer: Ada
---
Reply to {{customer}} about ticket {{ticket_id}}.
`);

  const report = await checkPrompts(['*.md'], { cwd: workspace });
  const codes = report.files.flatMap((file) => file.findings.map((finding) => finding.code));

  assert.equal(report.ok, false);
  assert.equal(report.codes['undeclared-placeholder'], 1);
  assert.equal(report.codes['example-missing-input'], 1);
  assert.match(codes.join(','), /undeclared-placeholder/);
  assert.match(codes.join(','), /example-missing-input/);
});

test('checkPrompts requires every required input but permits omitted or supplied optional placeholders', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-required-inputs-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: static-summary
version: 1.0.0
inputs:
  - name: audience
  - name: tone
    required: false
outputs:
  - format: markdown
risks:
  - Do not invent facts.
examples:
  - name: missing audience
    inputs: {}
  - name: supplied optional tone
    inputs:
      audience: maintainers
      tone: concise
---
Write a {{tone}} summary for {{audience}}.
`);

  const report = await checkPrompts(['*.md'], { cwd: workspace });
  const finding = report.files[0]?.findings.find((item) => item.code === 'example-missing-input');

  assert.equal(report.ok, false);
  assert.equal(report.errors, 1);
  assert.equal(report.codes['example-missing-input'], 1);
  assert.equal(finding?.field, 'examples[0].inputs.audience');
  assert.match(finding?.message ?? '', /required input "audience"/);
  assert.doesNotMatch(JSON.stringify(report), /missing input "tone"/);
});

test('checkPrompts reports exact paths for unsupported fields and invalid schema values', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-schema-'));
  await writeFile(path.join(workspace, 'prompt.md'), `---
name: schema-errors
version: 1.0.0
unknown_root: true
inputs:
  - name: audience
    required: "false"
    typo: ignored
outputs:
  - format: markdown
    typo: ignored
risks:
  - Do not invent facts.
examples:
  - name: malformed
    typo: ignored
    inputs:
      audience: maintainers
      surprise: ignored
---
Write for {{audience}}.
`);

  const report = await checkPrompts(['*.md'], { cwd: workspace });
  const findings = report.files[0]?.findings.map(({ code, field }) => ({ code, field }));

  assert.equal(report.ok, false);
  assert.deepEqual(findings, [
    { code: 'unsupported-contract-field', field: 'unknown_root' },
    { code: 'unsupported-input-field', field: 'inputs[0].typo' },
    { code: 'invalid-input-required', field: 'inputs[0].required' },
    { code: 'unsupported-output-field', field: 'outputs[0].typo' },
    { code: 'unsupported-example-field', field: 'examples[0].typo' },
    { code: 'undeclared-example-input', field: 'examples[0].inputs.surprise' }
  ]);
});

test('checkPrompts reports malformed YAML per file and continues checking matched files', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'promptcontract-malformed-yaml-'));
  await writeFile(path.join(workspace, 'bad.md'), `---
name: [unterminated
---
Broken prompt.
`);
  await writeFile(path.join(workspace, 'good.md'), `---
name: valid
version: 1.0.0
inputs: []
outputs:
  - format: markdown
risks:
  - Do not invent facts.
examples:
  - name: static
    inputs: {}
---
Valid prompt.
`);

  const report = await checkPrompts(['*.md'], { cwd: workspace });

  assert.equal(report.ok, false);
  assert.equal(report.checked, 2);
  assert.equal(report.errors, 1);
  assert.equal(report.codes['invalid-frontmatter-yaml'], 1);
  assert.deepEqual(report.files.map((file) => file.path), ['bad.md', 'good.md']);
  assert.deepEqual(report.files[0]?.findings, [{
    severity: 'error',
    code: 'invalid-frontmatter-yaml',
    message: 'YAML frontmatter could not be parsed.',
    path: 'bad.md',
    field: 'frontmatter'
  }]);
  assert.equal(report.files[1]?.ok, true);
});
