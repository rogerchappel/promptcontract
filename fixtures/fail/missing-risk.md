---
name: support-reply
version: 1.0.0
inputs:
  - name: customer
outputs:
  - format: markdown
examples:
  - name: missing ticket input
    inputs:
      customer: Ada
---
Reply to {{customer}} about ticket {{ticket_id}}.
