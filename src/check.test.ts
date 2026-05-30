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
  assert.match(codes.join(','), /undeclared-placeholder/);
  assert.match(codes.join(','), /example-missing-input/);
});
