# Janus Data Model — Product Intelligence

```mermaid
erDiagram
    product_signal {
        id PK
        post_call_id FK
        deal_id FK
        account_id FK
        owner_user_id FK
        signal_type
        fw_product
        capability_area
        title
        description
        evidence
        deal_impact
        status
        reviewed_by FK
        cluster_id FK
        created_at
        updated_at
    }
    signal_cluster {
        id PK
        name
        capability_area
        description
        signal_count
        status
        created_at
        updated_at
    }

    product_signal ||--o{ post_call : "post_call_id"
    product_signal ||--o{ deal : "deal_id"
    product_signal ||--o{ account : "account_id"
    product_signal ||--o{ user : "owner_user_id"
    product_signal ||--o{ user : "reviewed_by"
    product_signal ||--o{ signal_cluster : "cluster_id"
```