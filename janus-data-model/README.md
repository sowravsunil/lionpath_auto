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
| [`connections.md`](./connections.md) | Markdown **relationship index** | All **52 FK edges** as a readable edge list, grouped by source-table domain |
| `table-<name>.md` (×30) | Mermaid `erDiagram` (per-table) | One file per table — central table + immediate FK neighbors (inbound & outbound), columns, relationship bullets, spec note |

## Domains, tables & per-table files

| # | Domain | Tables (with per-table file links) | Domain file |
|--:|---|---|---|
| 1 | Identity & Org | [`user`](./table-user.md) · [`user_identity`](./table-user_identity.md) · [`org_unit`](./table-org_unit.md) · [`role`](./table-role.md) · [`user_role`](./table-user_role.md) | [`domain-identity-org.md`](./domain-identity-org.md) |
| 2 | Customer | [`account`](./table-account.md) · [`contact`](./table-contact.md) · [`deal`](./table-deal.md) · [`deal_contact`](./table-deal_contact.md) | [`domain-customer.md`](./domain-customer.md) |
| 3 | Activity & Call | [`activity`](./table-activity.md) · [`pre_call`](./table-pre_call.md) · [`post_call`](./table-post_call.md) · [`call_participant`](./table-call_participant.md) · [`task`](./table-task.md) | [`domain-activity-call.md`](./domain-activity-call.md) |
| 4 | Scoring | [`rubric_theme`](./table-rubric_theme.md) · [`rubric`](./table-rubric.md) · [`rubric_parameter`](./table-rubric_parameter.md) · [`scorecard`](./table-scorecard.md) · [`scorecard_line`](./table-scorecard_line.md) · [`score_override`](./table-score_override.md) | [`domain-scoring.md`](./domain-scoring.md) |
| 5 | Product Intelligence | [`product_signal`](./table-product_signal.md) · [`signal_cluster`](./table-signal_cluster.md) | [`domain-product-intelligence.md`](./domain-product-intelligence.md) |
| 6 | Coaching | [`coaching_focus`](./table-coaching_focus.md) · [`coaching_reflection`](./table-coaching_reflection.md) · [`coaching_recommendation`](./table-coaching_recommendation.md) | [`domain-coaching.md`](./domain-coaching.md) |
| 7 | Integration | [`integration`](./table-integration.md) · [`sync_job`](./table-sync_job.md) · [`webhook_event`](./table-webhook_event.md) | [`domain-integration.md`](./domain-integration.md) |
| 8 | Platform | [`ai_run`](./table-ai_run.md) · [`audit_log`](./table-audit_log.md) | [`domain-platform.md`](./domain-platform.md) |

**Totals:** 30 tables · 8 domains · 52 FK edges.

## Per-table file index

Each `table-<name>.md` shows one table and its immediate FK neighbors — a focused local-context view.

### Identity & Org

| Table | File |
|---|---|
| `user` | [`table-user.md`](./table-user.md) |
| `user_identity` | [`table-user_identity.md`](./table-user_identity.md) |
| `org_unit` | [`table-org_unit.md`](./table-org_unit.md) |
| `role` | [`table-role.md`](./table-role.md) |
| `user_role` | [`table-user_role.md`](./table-user_role.md) |

### Customer

| Table | File |
|---|---|
| `account` | [`table-account.md`](./table-account.md) |
| `contact` | [`table-contact.md`](./table-contact.md) |
| `deal` | [`table-deal.md`](./table-deal.md) |
| `deal_contact` | [`table-deal_contact.md`](./table-deal_contact.md) |

### Activity & Call

| Table | File |
|---|---|
| `activity` | [`table-activity.md`](./table-activity.md) |
| `pre_call` | [`table-pre_call.md`](./table-pre_call.md) |
| `post_call` | [`table-post_call.md`](./table-post_call.md) |
| `call_participant` | [`table-call_participant.md`](./table-call_participant.md) |
| `task` | [`table-task.md`](./table-task.md) |

### Scoring

| Table | File |
|---|---|
| `rubric_theme` | [`table-rubric_theme.md`](./table-rubric_theme.md) |
| `rubric` | [`table-rubric.md`](./table-rubric.md) |
| `rubric_parameter` | [`table-rubric_parameter.md`](./table-rubric_parameter.md) |
| `scorecard` | [`table-scorecard.md`](./table-scorecard.md) |
| `scorecard_line` | [`table-scorecard_line.md`](./table-scorecard_line.md) |
| `score_override` | [`table-score_override.md`](./table-score_override.md) |

### Product Intelligence

| Table | File |
|---|---|
| `product_signal` | [`table-product_signal.md`](./table-product_signal.md) |
| `signal_cluster` | [`table-signal_cluster.md`](./table-signal_cluster.md) |

### Coaching

| Table | File |
|---|---|
| `coaching_focus` | [`table-coaching_focus.md`](./table-coaching_focus.md) |
| `coaching_reflection` | [`table-coaching_reflection.md`](./table-coaching_reflection.md) |
| `coaching_recommendation` | [`table-coaching_recommendation.md`](./table-coaching_recommendation.md) |

### Integration

| Table | File |
|---|---|
| `integration` | [`table-integration.md`](./table-integration.md) |
| `sync_job` | [`table-sync_job.md`](./table-sync_job.md) |
| `webhook_event` | [`table-webhook_event.md`](./table-webhook_event.md) |

### Platform

| Table | File |
|---|---|
| `ai_run` | [`table-ai_run.md`](./table-ai_run.md) |
| `audit_log` | [`table-audit_log.md`](./table-audit_log.md) |

## Relationship index

See [`connections.md`](./connections.md) for the full edge list of all 52 FK relationships, grouped by domain.

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
