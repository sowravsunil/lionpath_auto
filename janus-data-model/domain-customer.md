# Janus Data Model — Customer

```mermaid
erDiagram
    account {
        id PK
        name
        domain
        slug UQ
        industry
        health_data JSONB
        external_ref
        sync_state
        created_at
        updated_at
    }
    contact {
        id PK
        account_id FK
        email UQ
        name
        title
        role
        created_at
        updated_at
    }
    deal {
        id PK
        account_id FK
        owner_user_id FK
        org_unit_id FK
        name
        stage
        status
        close_date
        amount
        technical_commit JSONB
        meddpicc JSONB
        ai_agent
        copilot
        freshcaller
        other_addons
        external_ref
        sync_state
        created_at
        updated_at
    }
    deal_contact {
        deal_id FK
        contact_id FK
        role
        first_seen_at
        last_seen_at
    }

    contact ||--o{ account : "account_id"
    deal ||--o{ account : "account_id"
    deal ||--o{ user : "owner_user_id"
    deal ||--o{ org_unit : "org_unit_id"
    deal_contact ||--o{ deal : "deal_id"
    deal_contact ||--o{ contact : "contact_id"
    activity ||--o{ deal : "deal_id"
    activity ||--o{ account : "account_id"
    pre_call ||--o{ deal : "deal_id"
    post_call ||--o{ deal : "deal_id"
    call_participant ||--o{ contact : "contact_id"
    task ||--o{ deal : "deal_id"
    product_signal ||--o{ deal : "deal_id"
    product_signal ||--o{ account : "account_id"
```