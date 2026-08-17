# `table-task.md` — task  (domain: Activity & Call)

Focused local-context view of the **task** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    task {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        bigint owner_user_id FK
        text title
        text description
        text status
        date due_date
        text source
        timestamptz created_at
        timestamptz updated_at
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
    user {
        bigint id PK
        text email "unique"
        text display_name
        text job_title
        text job_level
        bigint org_unit_id FK
        text status
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }

    activity ||--o{ task : "activity_id"
    deal ||--o{ task : "deal_id"
    user ||--o{ task : "owner_user_id"
```

## Relationships

**Outbound (this table → target via column):**
- `task.activity_id` → `activity.id` (N:1)
- `task.deal_id` → `deal.id` (N:1)
- `task.owner_user_id` → `user.id` (N:1)

## Notes

A follow-up task (AI-generated or manual).
