# PromptContract

PromptContract validates prompt markdown files with YAML frontmatter contracts.
It checks that each prompt declares its inputs, outputs, examples, and risk
boundaries, then verifies that `{{placeholders}}` in the prompt body are covered
by the contract and examples.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

```sh
npm install
```

## Use

Validate prompt files and print a Markdown report:

```sh
npx promptcontract check "prompts/**/*.md"
```

Write a JSON report for automation:

```sh
npx promptcontract check "prompts/**/*.md" --report json --output promptcontract-report.json
```

Prompt files must start with YAML frontmatter:

```md
---
name: release-note
version: 1.0.0
inputs:
  - name: product
outputs:
  - format: markdown
risks:
  - Do not invent shipped changes.
examples:
  - name: normal
    inputs:
      product: Widget CLI
---
Write a release note for {{product}}.
```

Exit code `0` means every matched prompt passed. Exit code `1` means the command
failed or one or more prompt contracts have validation errors.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
