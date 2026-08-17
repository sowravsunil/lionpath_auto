# `table-deal.md` — deal  (domain: Customer)

Focused local-context view of the **deal** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    deal_contact {
        bigint deal_id FK
        bigint contact_id FK
        text role
        timestamptz first_seen_at
        timestamptz last_seen_at
    }
    org_unit {
        bigint id PK
        text name
        bigint parent_id FK
        text unit_type
        timestamptz created_at
        timestamptz updated_at
    }
    post_call {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        text transcript_ref
        JSONB analysis
        JSONB detail
        timestamptz created_at
        timestamptz updated_at
    }
    pre_call {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        JSONB research_brief
        JSONB input_snapshot
        timestamptz generated_at
        timestamptz created_at
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

    account ||--o{ deal : "account_id"
    user ||--o{ deal : "owner_user_id"
    org_unit ||--o{ deal : "org_unit_id"
    deal ||--o{ deal_contact : "deal_id"
    deal ||--o{ activity : "deal_id"
    deal ||--o{ pre_call : "deal_id"
    deal ||--o{ post_call : "deal_id"
    deal ||--o{ task : "deal_id"
    deal ||--o{ product_signal : "deal_id"
```

## Relationships

**Outbound (this table → target via column):**
- `deal.account_id` → `account.id` (N:1)
- `deal.owner_user_id` → `user.id` (N:1)
- `deal.org_unit_id` → `org_unit.id` (N:1)

**Inbound (source → this table via column):**
- `deal_contact.deal_id` → `deal.id` (1:N)
- `activity.deal_id` → `deal.id` (1:N)
- `pre_call.deal_id` → `deal.id` (1:N)
- `post_call.deal_id` → `deal.id` (1:N)
- `task.deal_id` → `deal.id` (1:N)
- `product_signal.deal_id` → `deal.id` (1:N)

## Notes

A sales opportunity. Holds TC + MEDDPICC JSONB, add-ons.
