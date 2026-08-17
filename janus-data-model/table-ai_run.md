# `table-ai_run.md` — ai_run  (domain: Platform)

Focused local-context view of the **ai_run** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    ai_run {
        bigint id PK
        bigint activity_id FK
        text run_type
        text model
        text prompt_version
        int input_tokens
        int output_tokens
        numeric cost_usd
        int latency_ms
        timestamptz created_at
    }
    activity {
        bigint id PK
        bigint deal_id FK
        bigint account_id FK
        bigint owner_user_id FK
        bigint org_unit_id FK
        text activity_type
        text subject
        text description
        timestamptz occurred_at
        int duration_minutes
        bigint source_integration FK
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }

    activity ||--o{ ai_run : "activity_id"
```

## Relationships

**Outbound (this table → target via column):**
- `ai_run.activity_id` → `activity.id` (N:1)

## Notes

An AI pipeline run with cost/latency tracking.
