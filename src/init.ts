import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type InitOptions = {
  cwd?: string;
  force?: boolean;
  sampleName?: string;
};

export type InitResult = {
  promptPath: string;
  created: boolean;
};

const SAMPLE_PROMPT = `---
name: release-note-drafter
version: 0.1.0
description: Draft concise release notes from a local change summary.
inputs:
  - name: changes
    required: true
    description: Bullet list of merged changes.
  - name: audience
    required: true
    description: Intended reader for the release note.
outputs:
  - format: markdown
    description: Release note with highlights, fixes, and upgrade notes.
risks:
  - Do not claim releases, tags, or deployments that were not provided.
examples:
  - name: small patch
    inputs:
      changes: "fix parser crash; add CLI smoke test"
      audience: "maintainers"
    output: "## Highlights\\n- Fixed parser crash.\\n- Added CLI smoke coverage."
---

Write a release note for {{audience}} from these changes:

{{changes}}
`;

export async function initPromptContract(options: InitOptions = {}): Promise<InitResult> {
  const cwd = options.cwd ?? process.cwd();
  const sampleName = options.sampleName ?? 'release-note.prompt.md';
  const promptPath = path.join(cwd, 'prompts', sampleName);

  await mkdir(path.dirname(promptPath), { recursive: true });

  try {
    await writeFile(promptPath, SAMPLE_PROMPT, { flag: options.force ? 'w' : 'wx' });
    return { promptPath, created: true };
  } catch (error) {
    if (isAlreadyExists(error)) {
      return { promptPath, created: false };
    }

    throw error;
  }
}

function isAlreadyExists(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST';
}
