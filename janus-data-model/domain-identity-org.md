# Janus Data Model — Identity & Org

```mermaid
erDiagram
    user {
        id PK
        email UQ
        display_name
        job_title
        job_level
        org_unit_id FK
        status
        external_ref
        sync_state
        created_at
        updated_at
    }
    user_identity {
        id PK
        user_id FK
        auth_provider
        auth_uid
        created_at
    }
    org_unit {
        id PK
        name
        parent_id FK
        unit_type
        created_at
        updated_at
    }
    role {
        id PK
        name
        description
        role_type
        created_at
    }
    user_role {
        user_id FK
        role_id FK
        valid_from
        valid_to
        granted_by FK
        created_at
    }

    user ||--o{ org_unit : "org_unit_id"
    user_identity ||--o{ user : "user_id"
    user_role ||--o{ user : "user_id"
    user_role ||--o{ role : "role_id"
    user_role ||--o{ user : "granted_by"
    deal ||--o{ user : "owner_user_id"
    deal ||--o{ org_unit : "org_unit_id"
    activity ||--o{ user : "owner_user_id"
    activity ||--o{ org_unit : "org_unit_id"
    task ||--o{ user : "owner_user_id"
    scorecard ||--o{ user : "owner_user_id"
    score_override ||--o{ user : "created_by"
    product_signal ||--o{ user : "owner_user_id"
    product_signal ||--o{ user : "reviewed_by"
    coaching_focus ||--o{ user : "se_user_id"
    coaching_focus ||--o{ user : "set_by_user_id"
    coaching_reflection ||--o{ user : "se_user_id"
    coaching_recommendation ||--o{ user : "se_user_id"
    audit_log ||--o{ user : "user_id"
```