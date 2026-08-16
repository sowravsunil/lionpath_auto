# Janus — Data Model Visualizations

Visualizations of the proposed **Postgres** schema for **Janus**, the internal
Freshworks Solution Engineer coaching portal. The model (spec v4) defines
**30 tables across 8 domains** with **52 foreign-key relationships**, migrated
from the current Firestore layout.

These files are the database-schema analogue of the repo's
[`graphify-out/`](../graphify-out/) knowledge graph — but for the data model
instead of the code.

## What's here

| File | Style | Scope |
|---|---|---|
| [`data-model-graph.html`](./data-model-graph.html) | Interactive **D3.js** force-directed graph (dark theme) | **All 30 tables**, every FK edge, domain-colored nodes, drag/zoom/hover-tooltips, search, per-domain show/hide |
| [`high-level.md`](./high-level.md) | Mermaid `erDiagram` | **All 30 tables** with full column lists + all 52 FK edges |
| `domain-*.md` (×8) | Mermaid `erDiagram` (focused) | One file per domain — columns, PK/FK, and both **internal** + **cross-domain** relationships |

## Domains & tables

| # | Domain | Tables | File |
|---|---|---|---|
| 1 | Identity & Org | `user`, `user_identity`, `org_unit`, `role`, `user_role` | [`domain-identity-org.md`](./domain-identity-org.md) |
| 2 | Customer | `account`, `contact`, `deal`, `deal_contact` | [`domain-customer.md`](./domain-customer.md) |
| 3 | Activity & Call | `activity`, `pre_call`, `post_call`, `call_participant`, `task` | [`domain-activity-call.md`](./domain-activity-call.md) |
| 4 | Scoring | `rubric_theme`, `rubric`, `rubric_parameter`, `scorecard`, `scorecard_line`, `score_override` | [`domain-scoring.md`](./domain-scoring.md) |
| 5 | Product Intelligence | `product_signal`, `signal_cluster` | [`domain-product-intelligence.md`](./domain-product-intelligence.md) |
| 6 | Coaching | `coaching_focus`, `coaching_reflection`, `coaching_recommendation` | [`domain-coaching.md`](./domain-coaching.md) |
| 7 | Integration | `integration`, `sync_job`, `webhook_event` | [`domain-integration.md`](./domain-integration.md) |
| 8 | Platform | `ai_run`, `audit_log` | [`domain-platform.md`](./domain-platform.md) |

**Totals:** 30 tables · 8 domains · 52 FK edges.

## Color palette (8 domains)

| Domain | Color |
|---|---|
| Identity & Org | `#4E79A7` blue |
| Customer | `#F28E2B` orange |
| Activity & Call | `#59A14F` green |
| Scoring | `#E15759` red |
| Product Intelligence | `#B07AA1` purple |
| Coaching | `#76B7B2` teal |
| Integration | `#EDC948` yellow |
| Platform | `#FF9DA7` pink |

## How to view

- **`data-model-graph.html`** — open directly in any modern browser. D3.js v7 is
  loaded from the CDN; no build step. Drag nodes, scroll to zoom, hover a node
  for a column tooltip, click to focus + highlight its FK neighborhood, use the
  search box to jump to a table, toggle domains in the legend to isolate a
  domain. Controls (top-left): zoom in/out, fit, toggle FK labels, re-layout.
- **`*.md`** — the Mermaid `erDiagram` blocks render natively on GitHub (and in
  any Mermaid-aware Markdown viewer). On GitHub they appear as diagrams
  automatically; locally use VS Code's Mermaid preview or `mermaid-cli`.

## Relationship conventions

- `||--o{` one-to-many · `||--||` one-to-one · `}o--o{` many-to-many (via join
  table, e.g. `deal_contact`).
- **1:1** extensions are noted on the FK column comment (e.g. `pre_call` /
  `post_call` / `scorecard` → `activity`).
- Column annotations: **PK** primary key · **FK** foreign key · **`"unique"`**
  unique-constrained column (shown as a comment — Mermaid's erDiagram grammar
  only recognises `PK`/`FK` as key markers) · `JSONB` typed JSON column.
- Multiple FKs to the same target table (e.g. `product_signal` → `user` twice,
  via `owner_user_id` and `reviewed_by`) are drawn as **separate** edges — they
  are distinct relationships, not the same link.

## Provenance

Generated from the Janus data-model spec v4. This directory supersedes any
prior hand-transferred version. See the repo root `README.md` for project
context.