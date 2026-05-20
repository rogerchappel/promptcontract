# promptcontract PRD

Status: in-progress

## Summary

`promptcontract` is a local lint and validation CLI for reusable prompt files.
It checks that prompt packs declare required inputs, safety boundaries, output
contracts, and examples before agents or apps consume them.

## Source Attribution

Inspired by local-first AI assistant and agent workflow tooling trends, where
prompts increasingly behave like versioned source assets. This idea is framed
as deterministic prompt contract validation rather than prompt generation.

## Problem

Prompt libraries often rot because inputs, outputs, and safety assumptions live
in prose. A small contract format lets developers catch missing variables,
unstated output formats, and broken examples before runtime.

## Target Users

- Agent developers maintaining prompt packs.
- Teams reviewing prompt changes in git.
- CLI users who want local validation without a SaaS prompt registry.

## V1 Scope

- `promptcontract init`
- `promptcontract check prompts/**/*.md`
- YAML front matter schema for name, version, inputs, outputs, risks, and
  examples.
- Variable reference validation for `{{name}}` placeholders.
- Markdown report and JSON report.
- Example prompt pack with passing and failing fixtures.

## Non-Goals

- Prompt optimization or LLM scoring.
- Hosted registry.
- Secret management.

## Success Criteria

- Invalid fixture prompts fail with actionable messages.
- Valid prompt packs pass locally and in CI.
- README includes the contract schema and examples.

