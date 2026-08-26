import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const cliPath = fileURLToPath(new URL('./cli.js', import.meta.url));
const packagePath = fileURLToPath(new URL('../package.json', import.meta.url));

test('CLI --version matches the package.json version', async () => {
  const { version } = JSON.parse(await readFile(packagePath, 'utf8')) as { version: string };

  assert.ok(version.length > 0, 'package.json must declare a non-empty version');

  const result = spawnSync(process.execPath, [cliPath, '--version'], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr || 'CLI --version must exit 0');
  assert.equal(result.stdout.trim(), version, 'CLI --version must equal the package.json version');
});