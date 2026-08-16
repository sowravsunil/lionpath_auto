# Janus Data Model — Activity & Call

```mermaid
erDiagram
    activity {
        id PK
        deal_id FK
        account_id FK
        owner_user_id FK
        org_unit_id FK
        activity_type
        subject
        description
        occurred_at
        duration_minutes
        source_integration FK
        external_ref
        sync_state
        created_at
        updated_at
    }
    pre_call {
        id PK
        activity_id FK 1:1
        deal_id FK
        research_brief JSONB
        input_snapshot JSONB
        generated_at
        created_at
    }
    post_call {
        id PK
        activity_id FK 1:1
        deal_id FK
        transcript_ref
        analysis JSONB
        detail JSONB
        created_at
        updated_at
    }
    call_participant {
        id PK
        activity_id FK
        contact_id FK
        participant_role
        created_at
    }
    task {
        id PK
        activity_id FK
        deal_id FK
        owner_user_id FK
        title
        description
        status
        due_date
        source
        created_at
        updated_at
    }

    activity ||--o{ deal : "deal_id"
    activity ||--o{ account : "account_id"
    activity ||--o{ user : "owner_user_id"
    activity ||--o{ org_unit : "org_unit_id"
    activity ||--o{ integration : "source_integration"
    pre_call ||--o{ activity : "activity_id"
    pre_call ||--o{ deal : "deal_id"
    post_call ||--o{ activity : "activity_id"
    post_call ||--o{ deal : "deal_id"
    call_participant ||--o{ activity : "activity_id"
    call_participant ||--o{ contact : "contact_id"
    task ||--o{ activity : "activity_id"
    task ||--o{ deal : "deal_id"
    task ||--o{ user : "owner_user_id"
    scorecard ||--o{ activity : "activity_id"
    product_signal ||--o{ post_call : "post_call_id"
    coaching_reflection ||--o{ activity : "activity_id"
    ai_run ||--o{ activity : "activity_id"
```