import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { parsePromptFile } from './frontmatter.js';
import type { CheckReport, FileResult } from './types.js';
import { validatePromptFile } from './validate.js';

export type CheckOptions = {
  cwd?: string;
};

export async function checkPrompts(patterns: string[], options: CheckOptions = {}): Promise<CheckReport> {
  const cwd = options.cwd ?? process.cwd();
  const entries = await fg(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true
  });

  const results: FileResult[] = [];

  for (const absolutePath of entries.sort()) {
    const source = await readFile(absolutePath, 'utf8');
    const relativePath = path.relative(cwd, absolutePath);
    const prompt = parsePromptFile(relativePath, source);
    results.push(validatePromptFile(prompt, source));
  }

  const errors = results.reduce((count, result) => count + result.findings.filter((finding) => finding.severity === 'error').length, 0);
  const warnings = results.reduce((count, result) => count + result.findings.filter((finding) => finding.severity === 'warning').length, 0);

  return {
    ok: errors === 0,
    checked: results.length,
    errors,
    warnings,
    files: results
  };
}
