import { parse } from 'yaml';
import type { PromptFile } from './types.js';

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parsePromptFile(path: string, source: string): PromptFile {
  const match = frontmatterPattern.exec(source);
  if (!match) {
    return {
      path,
      contract: {},
      body: source,
      rawFrontmatter: ''
    };
  }

  const rawFrontmatter = match[1] ?? '';
  const parsed = parse(rawFrontmatter);

  return {
    path,
    contract: isRecord(parsed) ? parsed : {},
    body: source.slice(match[0].length),
    rawFrontmatter
  };
}

export function hasFrontmatter(source: string): boolean {
  return frontmatterPattern.test(source);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
