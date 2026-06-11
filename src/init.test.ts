import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { initPromptContract } from './init.js';
import { checkPrompts } from './check.js';

test('init writes a valid sample prompt contract', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'promptcontract-init-'));

  try {
    const result = await initPromptContract({ cwd: root });
    const sample = await readFile(result.promptPath, 'utf8');
    const report = await checkPrompts(['prompts/*.md'], { cwd: root });

    assert.equal(result.created, true);
    assert.match(sample, /name: release-note-drafter/);
    assert.equal(report.ok, true);
    assert.equal(report.checked, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('init is idempotent unless force is requested', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'promptcontract-init-'));

  try {
    const first = await initPromptContract({ cwd: root });
    const second = await initPromptContract({ cwd: root });

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.promptPath, first.promptPath);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
