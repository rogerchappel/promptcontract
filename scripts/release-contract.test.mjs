import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('release validation accepts only the package version tag', () => {
  const valid = execFileSync(process.execPath, ['scripts/validate-release.mjs', `v${pkg.version}`], {
    encoding: 'utf8',
  });
  assert.match(valid, new RegExp(`${pkg.name}@${pkg.version}`));

  const invalid = spawnSync(process.execPath, ['scripts/validate-release.mjs', 'v999.0.0'], {
    encoding: 'utf8',
  });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /does not match package version/);
});

test('release workflow validates, publishes with provenance, then creates the release', () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  const validateAt = workflow.indexOf('Validate release tag');
  const publishAt = workflow.indexOf('Publish tested package');
  const releaseAt = workflow.indexOf('Create GitHub release');

  assert.ok(validateAt >= 0 && validateAt < publishAt && publishAt < releaseAt);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /registry-url: https:\/\/registry\.npmjs\.org/);
  assert.match(workflow, /npm publish[^\n]*--provenance[^\n]*--access public/);
});

test('dry run validates a prospective tag and packed contents without publishing', () => {
  const workflow = readFileSync('.github/workflows/release-dry-run.yml', 'utf8');
  assert.match(workflow, /Validate prospective release/);
  assert.match(workflow, /validate-release\.mjs/);
  assert.match(workflow, /npm pack/);
  assert.doesNotMatch(workflow, /npm publish/);
});

test('CI tests every supported Node major from the package engine floor', () => {
  const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
  const engineFloor = Number(pkg.engines.node.match(/\d+/)?.[0]);
  const nodeVersions = workflow
    .match(/node-version:\s*\[([^\]]+)\]/)?.[1]
    .split(',')
    .map((version) => Number(version.trim()));

  assert.equal(engineFloor, 20);
  assert.deepEqual(nodeVersions, [20, 22, 24]);
  assert.match(workflow, /uses: actions\/setup-node@v\d+/);
  assert.match(workflow, /node-version:\s*\$\{\{ matrix\.node-version \}\}/);
  assert.match(workflow, /cache:\s*npm/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /run:\s*npm run release:check/);
});
