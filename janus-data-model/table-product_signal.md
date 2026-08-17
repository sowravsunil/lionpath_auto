# `table-product_signal.md` — product_signal  (domain: Product Intelligence)

Focused local-context view of the **product_signal** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    signal_cluster {
        bigint id PK
        text name
        text capability_area
        text description
        int signal_count
        text status
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

    post_call ||--o{ product_signal : "post_call_id"
    deal ||--o{ product_signal : "deal_id"
    account ||--o{ product_signal : "account_id"
    user ||--o{ product_signal : "owner_user_id"
    user ||--o{ product_signal : "reviewed_by"
    signal_cluster ||--o{ product_signal : "cluster_id"
```

## Relationships

**Outbound (this table → target via column):**
- `product_signal.post_call_id` → `post_call.id` (N:1)
- `product_signal.deal_id` → `deal.id` (N:1)
- `product_signal.account_id` → `account.id` (N:1)
- `product_signal.owner_user_id` → `user.id` (N:1)
- `product_signal.reviewed_by` → `user.id` (N:1)
- `product_signal.cluster_id` → `signal_cluster.id` (N:1)

## Notes

AI-extracted product signal for PM triage (8 types).
