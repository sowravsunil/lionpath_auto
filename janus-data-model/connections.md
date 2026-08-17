# `connections.md` — Relationship Index

Readable edge list of all **52 foreign-key relationships** in the Janus data model (spec v4), grouped by the domain of the **source** (child/FK-holding) table.

Each row shows: **source table** · **column** → **target table** · **column**, plus the relationship cardinality.

Cardinality legend: **N:1** many-child to one-parent (the usual FK) · **1:1** one-to-one satellite (pre_call / post_call / scorecard → activity).

## Identity & Org

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `user` | `org_unit_id` | → | `org_unit` | `id` | N:1 |
| 2 | `user_identity` | `user_id` | → | `user` | `id` | N:1 |
| 3 | `user_role` | `user_id` | → | `user` | `id` | N:1 |
| 4 | `user_role` | `role_id` | → | `role` | `id` | N:1 |
| 5 | `user_role` | `granted_by` | → | `user` | `id` | N:1 |

## Customer

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `contact` | `account_id` | → | `account` | `id` | N:1 |
| 2 | `deal` | `account_id` | → | `account` | `id` | N:1 |
| 3 | `deal` | `owner_user_id` | → | `user` | `id` | N:1 |
| 4 | `deal` | `org_unit_id` | → | `org_unit` | `id` | N:1 |
| 5 | `deal_contact` | `deal_id` | → | `deal` | `id` | N:1 |
| 6 | `deal_contact` | `contact_id` | → | `contact` | `id` | N:1 |

## Activity & Call

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `activity` | `deal_id` | → | `deal` | `id` | N:1 |
| 2 | `activity` | `account_id` | → | `account` | `id` | N:1 |
| 3 | `activity` | `owner_user_id` | → | `user` | `id` | N:1 |
| 4 | `activity` | `org_unit_id` | → | `org_unit` | `id` | N:1 |
| 5 | `activity` | `source_integration` | → | `integration` | `id` | N:1 |
| 6 | `pre_call` | `activity_id` | → | `activity` | `id` | 1:1 |
| 7 | `pre_call` | `deal_id` | → | `deal` | `id` | N:1 |
| 8 | `post_call` | `activity_id` | → | `activity` | `id` | 1:1 |
| 9 | `post_call` | `deal_id` | → | `deal` | `id` | N:1 |
| 10 | `call_participant` | `activity_id` | → | `activity` | `id` | N:1 |
| 11 | `call_participant` | `contact_id` | → | `contact` | `id` | N:1 |
| 12 | `task` | `activity_id` | → | `activity` | `id` | N:1 |
| 13 | `task` | `deal_id` | → | `deal` | `id` | N:1 |
| 14 | `task` | `owner_user_id` | → | `user` | `id` | N:1 |

## Scoring

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `rubric` | `rubric_theme_id` | → | `rubric_theme` | `id` | N:1 |
| 2 | `rubric_parameter` | `rubric_id` | → | `rubric` | `id` | N:1 |
| 3 | `scorecard` | `activity_id` | → | `activity` | `id` | 1:1 |
| 4 | `scorecard` | `owner_user_id` | → | `user` | `id` | N:1 |
| 5 | `scorecard` | `rubric_id` | → | `rubric` | `id` | N:1 |
| 6 | `scorecard_line` | `scorecard_id` | → | `scorecard` | `id` | N:1 |
| 7 | `scorecard_line` | `rubric_parameter_id` | → | `rubric_parameter` | `id` | N:1 |
| 8 | `score_override` | `scorecard_line_id` | → | `scorecard_line` | `id` | N:1 |
| 9 | `score_override` | `created_by` | → | `user` | `id` | N:1 |

## Product Intelligence

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `product_signal` | `post_call_id` | → | `post_call` | `id` | N:1 |
| 2 | `product_signal` | `deal_id` | → | `deal` | `id` | N:1 |
| 3 | `product_signal` | `account_id` | → | `account` | `id` | N:1 |
| 4 | `product_signal` | `owner_user_id` | → | `user` | `id` | N:1 |
| 5 | `product_signal` | `reviewed_by` | → | `user` | `id` | N:1 |
| 6 | `product_signal` | `cluster_id` | → | `signal_cluster` | `id` | N:1 |

## Coaching

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `coaching_focus` | `se_user_id` | → | `user` | `id` | N:1 |
| 2 | `coaching_focus` | `set_by_user_id` | → | `user` | `id` | N:1 |
| 3 | `coaching_focus` | `rubric_theme_id` | → | `rubric_theme` | `id` | N:1 |
| 4 | `coaching_reflection` | `se_user_id` | → | `user` | `id` | N:1 |
| 5 | `coaching_reflection` | `coaching_focus_id` | → | `coaching_focus` | `id` | N:1 |
| 6 | `coaching_reflection` | `activity_id` | → | `activity` | `id` | N:1 |
| 7 | `coaching_recommendation` | `se_user_id` | → | `user` | `id` | N:1 |
| 8 | `coaching_recommendation` | `rubric_theme_id` | → | `rubric_theme` | `id` | N:1 |

## Integration

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `sync_job` | `integration_id` | → | `integration` | `id` | N:1 |
| 2 | `webhook_event` | `integration_id` | → | `integration` | `id` | N:1 |

## Platform

| # | Source table | Column | → | Target table | Column | Cardinality |
|--:|---|---|---|---|---|---|
| 1 | `ai_run` | `activity_id` | → | `activity` | `id` | N:1 |
| 2 | `audit_log` | `user_id` | → | `user` | `id` | N:1 |

---

**Total:** 52 foreign-key relationships across 8 domains.
