# `table-call_participant.md` — call_participant  (domain: Activity & Call)

Focused local-context view of the **call_participant** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    call_participant {
        bigint id PK
        bigint activity_id FK
        bigint contact_id FK
        text participant_role
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
    contact {
        bigint id PK
        bigint account_id FK
        text email "unique"
        text name
        text title
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    activity ||--o{ call_participant : "activity_id"
    contact ||--o{ call_participant : "contact_id"
```

## Relationships

**Outbound (this table → target via column):**
- `call_participant.activity_id` → `activity.id` (N:1)
- `call_participant.contact_id` → `contact.id` (N:1)

## Notes

Who attended a call.
