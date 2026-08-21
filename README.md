# promptcontract
Local-first prompt contract lint and validation CLI.
## Status

This is a v0.1.0 local-first developer tool. Treat the CLI and output formats as early-stage, pin versions in automation, and run the verification commands below before relying on it in CI.
## What it helps with

- Work with prompt, lint, cli, contracts, ai workflows from a local checkout.
- Keep generated artifacts and reports inspectable on disk instead of sending project data to a service.
- Add a repeatable smoke command that maintainers can run before review or release.

## Install from a checkout

```sh
git clone https://github.com/rogerchappel/promptcontract.git
cd promptcontract
npm install
npm run build
```
## CLI quickstart

Start with the built CLI help so the examples match the checked-out version:

```sh
node dist/cli.js --help
```

Create a passing sample contract for a new prompt pack:

```sh
node dist/cli.js init
```

Run the maintained smoke fixture to exercise the main workflow end to end:

```sh
npm run smoke
```

The smoke command currently expands to:

```sh
node scripts/smoke.mjs
```

The runner treats the fixtures as two separate contracts: the passing fixture
must exit with status 0, while the intentionally failing fixture must exit with
status 1. Any other status fails the smoke command and, consequently,
`npm run release:check`.

`check` also fails when none of the supplied patterns match a prompt file. This
guards CI against passing after a prompt directory is renamed or a glob is
mistyped. Both report formats retain `checked: 0` and include the stable
`no-files-matched` diagnostic; the CLI exits with status 1.

Every example must provide each declared input unless that input explicitly sets
`required: false`. Missing values produce the stable `example-missing-input`
finding with the exact `examples[n].inputs.<name>` field. This applies even when
the prompt body does not reference a required input as a `{{placeholder}}`;
optional inputs may be omitted even when the body does reference them.

Malformed YAML frontmatter is reported as `invalid-frontmatter-yaml` for the
affected file. The scanner continues through all other matched files, so both
Markdown and JSON reports remain complete; JSON output stays parseable and the
CLI exits with status 1 when any file has this finding.
## Verification

```sh
npm run check
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

## Limitations

- The project is intentionally local-first; it does not manage remote credentials or upload repository contents.
- Output schemas and CLI flags may change before a stable 1.0 release.
- Review generated files before committing them, especially when they summarize logs, diffs, or dependency metadata.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, include a fixture or smoke case when behavior changes, and paste verification output into the pull request.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting. Do not paste secrets, private tokens, or proprietary logs into issues or examples.

## License

MIT

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

Each verification command can be run independently; `npm test` builds its compiled test prerequisites first.
The package smoke uses `npm pack --dry-run --json` to inspect the published file list without publishing.
It also verifies that required runtime files are present and compiled test artifacts are excluded from the package.
