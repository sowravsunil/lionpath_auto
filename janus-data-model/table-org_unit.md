# `table-org_unit.md` — org_unit  (domain: Identity & Org)

Focused local-context view of the **org_unit** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    org_unit {
        bigint id PK
        text name
        bigint parent_id FK
        text unit_type
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

    org_unit }o--o{ org_unit : "parent_id (self)"
    org_unit ||--o{ user : "org_unit_id"
    org_unit ||--o{ deal : "org_unit_id"
    org_unit ||--o{ activity : "org_unit_id"
```

## Relationships

**Outbound (this table → target via column):**
- `org_unit.parent_id` → `org_unit.id` (self-ref)

**Inbound (source → this table via column):**
- `user.org_unit_id` → `org_unit.id` (1:N)
- `deal.org_unit_id` → `org_unit.id` (1:N)
- `activity.org_unit_id` → `org_unit.id` (1:N)

## Notes

Self-referencing org tree (org/region/team/squad).
