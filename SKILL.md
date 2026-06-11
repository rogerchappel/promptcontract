# promptcontract Skill

Use this skill when an agent needs to review, publish, or reuse prompt markdown files that should have explicit inputs, outputs, risks, and examples.

## Required Inputs

- One or more local prompt markdown files with YAML front matter.
- A shell with Node.js 20 or newer.
- No network access is required for validation.

## Side-Effect Boundaries

- `promptcontract check` is read-only unless `--output` is supplied.
- `promptcontract init` writes a sample file under `prompts/`.
- The tool does not call model APIs, upload prompts, mutate external systems, or manage secrets.

## Approval Requirements

- Ask before overwriting an existing prompt sample with `promptcontract init --force`.
- Ask before committing generated reports.
- Treat failures as review blockers when prompts will be shared with another agent or included in a release.

## Examples

```bash
promptcontract init
promptcontract check "prompts/**/*.md"
promptcontract check "prompts/**/*.md" --report json --output reports/promptcontract.json
```

## Validation Workflow

1. Run `npm run build` when using the repo checkout.
2. Run `promptcontract check` against the target prompt pack.
3. Review the finding code summary first, then fix per-file errors.
4. Re-run the command and keep the markdown or JSON report with release evidence when useful.
