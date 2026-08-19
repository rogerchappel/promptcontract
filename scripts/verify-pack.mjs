import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const requiredFiles = [
  'dist/cli.js',
  'dist/index.js',
  'fixtures/pass/release-note.md',
  'fixtures/fail/missing-risk.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md'
];

export function verifyPackedFiles(files) {
  const packedPaths = new Set(files.map((file) => file.path));
  const missing = requiredFiles.filter((file) => !packedPaths.has(file));
  const shippedTests = [...packedPaths].filter((file) => /(^|\/).+\.test\.(js|d\.ts|js\.map)$/.test(file));

  const errors = [];
  if (missing.length > 0) {
    errors.push(`Missing required package files: ${missing.join(', ')}`);
  }
  if (shippedTests.length > 0) {
    errors.push(`Packaged compiled test artifacts: ${shippedTests.join(', ')}`);
  }
  return { errors, fileCount: packedPaths.size };
}

export function main() {
  const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (pack.status !== 0) {
    process.stderr.write(pack.stderr);
    return pack.status ?? 1;
  }

  const [{ files = [] } = {}] = JSON.parse(pack.stdout);
  const { errors, fileCount } = verifyPackedFiles(files);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    return 1;
  }

  console.log(`Package manifest verified with ${fileCount} files.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main();
}
