# `table-account.md` — account  (domain: Customer)

Focused local-context view of the **account** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    product_signal {
        bigint id PK
        bigint post_call_id FK
        bigint deal_id FK
        bigint account_id FK
        bigint owner_user_id FK
        text signal_type
        text fw_product
        text capability_area
        text title
        text description
        text evidence
        text deal_impact
        text status
        bigint reviewed_by FK
        bigint cluster_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    account ||--o{ contact : "account_id"
    account ||--o{ deal : "account_id"
    account ||--o{ activity : "account_id"
    account ||--o{ product_signal : "account_id"
```

## Relationships

**Inbound (source → this table via column):**
- `contact.account_id` → `account.id` (1:N)
- `deal.account_id` → `account.id` (1:N)
- `activity.account_id` → `account.id` (1:N)
- `product_signal.account_id` → `account.id` (1:N)

## Notes

A customer account. Deduped by slug. Holds ChurnZero health_data.
