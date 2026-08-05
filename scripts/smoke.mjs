import { spawnSync } from 'node:child_process';

const passFixture = process.env.PROMPTCONTRACT_PASS_FIXTURE ?? 'fixtures/pass/*.md';
const failFixture = process.env.PROMPTCONTRACT_FAIL_FIXTURE ?? 'fixtures/fail/*.md';

function run(args, expectedStatus, label) {
  const result = spawnSync(process.execPath, ['dist/cli.js', ...args], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`${label} smoke check could not start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== expectedStatus) {
    console.error(
      `${label} smoke check exited ${result.status ?? 'without a status'}; expected ${expectedStatus}.`,
    );
    process.exit(1);
  }
}

run(['check', passFixture], 0, 'Passing fixture');
run(
  ['check', failFixture, '--report', 'json', '--output', 'tmp/fail-report.json'],
  1,
  'Intentionally failing fixture',
);
