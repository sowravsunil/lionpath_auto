# `table-pre_call.md` — pre_call  (domain: Activity & Call)

Focused local-context view of the **pre_call** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    pre_call {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        JSONB research_brief
        JSONB input_snapshot
        timestamptz generated_at
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
    deal {
        bigint id PK
        bigint account_id FK
        bigint owner_user_id FK
        bigint org_unit_id FK
        text name
        text stage
        text status
        date close_date
        numeric amount
        JSONB technical_commit
        JSONB meddpicc
        text ai_agent
        text copilot
        text freshcaller
        text other_addons
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }

    activity ||--|| pre_call : "activity_id"
    deal ||--o{ pre_call : "deal_id"
```

## Relationships

**Outbound (this table → target via column):**
- `pre_call.activity_id` → `activity.id` (1:1)
- `pre_call.deal_id` → `deal.id` (N:1)

## Notes

1:1 satellite for pre-call research brief.
