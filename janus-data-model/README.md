# Janus Data Model — Visualizations

Generated from the Janus Data Model & Integration Spec v4 (30 tables, 8 domains).

## High level
- [`data-model-graph.html`](data-model-graph.html) — interactive D3 force-directed graph of all 30 tables and their FK relationships.
- [`high-level.md`](high-level.md) — Mermaid ER diagram of the full model.

## Low level (per domain)

- [`domain-identity-org.md`](domain-identity-org.md) — Identity & Org (5 tables)
- [`domain-customer.md`](domain-customer.md) — Customer (4 tables)
- [`domain-activity-call.md`](domain-activity-call.md) — Activity & Call (5 tables)
- [`domain-scoring.md`](domain-scoring.md) — Scoring (6 tables)
- [`domain-product-intelligence.md`](domain-product-intelligence.md) — Product Intelligence (2 tables)
- [`domain-coaching.md`](domain-coaching.md) — Coaching (3 tables)
- [`domain-integration.md`](domain-integration.md) — Integration (3 tables)
- [`domain-platform.md`](domain-platform.md) — Platform (2 tables)

## Domains & tables

**Identity & Org:** `user`, `user_identity`, `org_unit`, `role`, `user_role`
**Customer:** `account`, `contact`, `deal`, `deal_contact`
**Activity & Call:** `activity`, `pre_call`, `post_call`, `call_participant`, `task`
**Scoring:** `rubric_theme`, `rubric`, `rubric_parameter`, `scorecard`, `scorecard_line`, `score_override`
**Product Intelligence:** `product_signal`, `signal_cluster`
**Coaching:** `coaching_focus`, `coaching_reflection`, `coaching_recommendation`
**Integration:** `integration`, `sync_job`, `webhook_event`
**Platform:** `ai_run`, `audit_log`