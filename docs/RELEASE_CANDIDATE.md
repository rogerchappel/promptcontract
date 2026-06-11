# Release Candidate Notes

## Scope

- Adds `promptcontract init` for bootstrapping a valid local sample prompt contract.
- Adds finding-code summaries to JSON and Markdown reports.
- Documents agent skill usage, side-effect boundaries, approvals, and validation.

## Verification

Run before merging:

```bash
npm run check
npm run build
npm test
npm run smoke
npm run package:smoke
```

## Classification

Ship. The project is local-first, deterministic, and useful for prompt-pack review before agents consume reusable prompts.
