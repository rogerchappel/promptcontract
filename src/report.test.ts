import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPrompts } from './check.js';
import { renderReport } from './report.js';

test('markdown and JSON reports agree that no matches are a failure', async () => {
  const report = await checkPrompts(['missing/**/*.md']);
  const markdown = renderReport(report, 'markdown');
  const json = JSON.parse(renderReport(report, 'json')) as typeof report;

  assert.match(markdown, /Status: FAIL/);
  assert.match(markdown, /Checked: 0/);
  assert.match(markdown, /ERROR no-files-matched: No prompt files matched/);
  assert.equal(json.ok, false);
  assert.equal(json.checked, 0);
  assert.equal(json.diagnostics[0]?.code, 'no-files-matched');
});
