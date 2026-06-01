---
name: release-note
version: 1.0.0
description: Drafts a concise release note from verified inputs.
inputs:
  - name: product
    required: true
    description: Product or package name.
  - name: change
    required: true
    description: Verified user-facing change.
outputs:
  - format: markdown
    description: Short release-note paragraph.
risks:
  - Do not invent adoption, performance, or roadmap claims.
examples:
  - name: package patch
    inputs:
      product: promptcontract
      change: adds fixture-backed smoke validation
---
Write a release note for {{product}} covering {{change}}.
