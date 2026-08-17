# `table-post_call.md` — post_call  (domain: Activity & Call)

Focused local-context view of the **post_call** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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

    activity ||--|| post_call : "activity_id"
    deal ||--o{ post_call : "deal_id"
    post_call ||--o{ product_signal : "post_call_id"
```

## Relationships

**Outbound (this table → target via column):**
- `post_call.activity_id` → `activity.id` (1:1)
- `post_call.deal_id` → `deal.id` (N:1)

**Inbound (source → this table via column):**
- `product_signal.post_call_id` → `post_call.id` (1:N)

## Notes

1:1 satellite for post-call analysis + detail JSONB.
