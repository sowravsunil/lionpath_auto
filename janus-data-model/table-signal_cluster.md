# `table-signal_cluster.md` — signal_cluster  (domain: Product Intelligence)

Focused local-context view of the **signal_cluster** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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

    signal_cluster ||--o{ product_signal : "cluster_id"
```

## Relationships

**Inbound (source → this table via column):**
- `product_signal.cluster_id` → `signal_cluster.id` (1:N)

## Notes

Groups related product signals.
