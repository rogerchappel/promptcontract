import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePromptFile } from './validate.js';
import type { PromptFile } from './types.js';

function prompt(inputNames: string[], exampleInputs: Record<string, unknown>, body: string): PromptFile {
  return {
    path: 'prompt.md',
    rawFrontmatter: '',
    body,
    contract: {
      name: 'test',
      version: '1.0.0',
      inputs: inputNames.map((name) => ({ name })),
      outputs: [{ format: 'text' }],
      risks: ['Do not invent facts.'],
      examples: [{ name: 'example', inputs: exampleInputs }]
    }
  };
}

test('reports an undeclared placeholder missing from an example', () => {
  const result = validatePromptFile(prompt(['declared'], { declared: 'value' }, 'Use {{declared}} and {{undeclared}}.'), '---\n---\n');
  const finding = result.findings.find(({ code, field }) => code === 'example-missing-input' && field === 'examples[0].inputs.undeclared');

  assert.deepEqual(finding, {
    severity: 'error',
    code: 'example-missing-input',
    message: 'examples[0] is missing input "undeclared".',
    path: 'prompt.md',
    field: 'examples[0].inputs.undeclared'
  });
});

test('reports a declared required input missing from an example', () => {
  const result = validatePromptFile(prompt(['required'], {}, 'No placeholder here.'), '---\n---\n');

  assert.ok(result.findings.some(({ code, field }) => code === 'example-missing-input' && field === 'examples[0].inputs.required'));
});
