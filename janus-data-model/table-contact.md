# `table-contact.md` — contact  (domain: Customer)

Focused local-context view of the **contact** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    account {
        bigint id PK
        text name
        text domain
        text slug "unique"
        text industry
        JSONB health_data
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }
    call_participant {
        bigint id PK
        bigint activity_id FK
        bigint contact_id FK
        text participant_role
        timestamptz created_at
    }
    deal_contact {
        bigint deal_id FK
        bigint contact_id FK
        text role
        timestamptz first_seen_at
        timestamptz last_seen_at
    }

    account ||--o{ contact : "account_id"
    contact ||--o{ deal_contact : "contact_id"
    contact ||--o{ call_participant : "contact_id"
```

## Relationships

**Outbound (this table → target via column):**
- `contact.account_id` → `account.id` (N:1)

**Inbound (source → this table via column):**
- `deal_contact.contact_id` → `contact.id` (1:N)
- `call_participant.contact_id` → `contact.id` (1:N)

## Notes

A person at an account. Email unique per account.
