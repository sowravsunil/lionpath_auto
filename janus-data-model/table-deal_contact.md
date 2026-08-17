# `table-deal_contact.md` — deal_contact  (domain: Customer)

Focused local-context view of the **deal_contact** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    deal_contact {
        bigint deal_id FK
        bigint contact_id FK
        text role
        timestamptz first_seen_at
        timestamptz last_seen_at
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

    deal ||--o{ deal_contact : "deal_id"
    contact ||--o{ deal_contact : "contact_id"
```

## Relationships

**Outbound (this table → target via column):**
- `deal_contact.deal_id` → `deal.id` (N:1)
- `deal_contact.contact_id` → `contact.id` (N:1)

## Notes

Junction tracking a contact's role on a deal across calls.
