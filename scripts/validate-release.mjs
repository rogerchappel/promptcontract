#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const [tag, archive] = process.argv.slice(2);
const expectedTag = `v${packageJson.version}`;

if (!tag) {
  throw new Error(`release tag is required (expected ${expectedTag})`);
}
if (tag !== expectedTag) {
  throw new Error(`release tag ${tag} does not match package version ${packageJson.version}`);
}

if (archive) {
  const archivePath = resolve(archive);
  const packedPackage = JSON.parse(
    execFileSync('tar', ['-xOf', archivePath, 'package/package.json'], { encoding: 'utf8' }),
  );
  if (packedPackage.name !== packageJson.name || packedPackage.version !== packageJson.version) {
    throw new Error(
      `packed identity ${packedPackage.name}@${packedPackage.version} does not match ` +
        `${packageJson.name}@${packageJson.version}`,
    );
  }
  process.stdout.write(`${archivePath}\n`);
} else {
  process.stdout.write(`${packageJson.name}@${packageJson.version} matches ${tag}\n`);
}

