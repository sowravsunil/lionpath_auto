# `table-audit_log.md` — audit_log  (domain: Platform)

Focused local-context view of the **audit_log** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    audit_log {
        bigint id PK
        bigint user_id FK
        text entity_type
        bigint entity_id
        text action
        JSONB payload
        timestamptz created_at
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

    user ||--o{ audit_log : "user_id"
```

## Relationships

**Outbound (this table → target via column):**
- `audit_log.user_id` → `user.id` (N:1)

## Notes

Append-only audit of all actions.
