# Janus Data Model — High Level (all 30 tables)

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
    rubric_theme {
        id PK
        name
        description
        display_order
        status
        created_at
    }
    rubric {
        id PK
        rubric_theme_id FK
        name
        description
        version
        display_order
        effective_from
        effective_to
        created_at
    }
    rubric_parameter {
        id PK
        rubric_id FK
        name
        description
        weight
        display_order
        created_at
    }
    scorecard {
        id PK
        activity_id FK 1:1
        owner_user_id FK
        rubric_id FK
        composite_score
        se_camera
        customer_camera
        created_at
    }
    scorecard_line {
        id PK
        scorecard_id FK
        rubric_parameter_id FK
        score
        evidence
        created_at
    }
    score_override {
        id PK
        scorecard_line_id FK
        previous_score
        new_score
        reason
        created_by FK
        created_at
    }
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
    coaching_focus {
        id PK
        se_user_id FK
        set_by_user_id FK
        rubric_theme_id FK
        description
        target
        status
        timeframe_start
        timeframe_end
        created_at
        updated_at
    }
    coaching_reflection {
        id PK
        se_user_id FK
        coaching_focus_id FK
        activity_id FK
        reflection_text
        created_at
    }
    coaching_recommendation {
        id PK
        se_user_id FK
        rubric_theme_id FK
        recommendation_text
        evidence_summary
        status
        generated_at
        dismissed_at
    }
    integration {
        id PK
        provider
        display_name
        auth_type
        credentials_ref
        config JSONB
        status
        last_healthy_at
        created_at
        updated_at
    }
    sync_job {
        id PK
        integration_id FK
        direction
        entity_type
        status
        records_processed
        records_failed
        error_summary
        started_at
        completed_at
    }
    webhook_event {
        id PK
        integration_id FK
        event_type
        payload JSONB
        processing_status
        linked_entity_type
        linked_entity_id
        received_at
        processed_at
    }
    ai_run {
        id PK
        activity_id FK
        run_type
        model
        prompt_version
        input_tokens
        output_tokens
        cost_usd
        latency_ms
        created_at
    }
    audit_log {
        id PK
        user_id FK
        entity_type
        entity_id
        action
        payload JSONB
        created_at
    }

    user ||--o{ org_unit : "org_unit_id"
    user_identity ||--o{ user : "user_id"
    user_role ||--o{ user : "user_id"
    user_role ||--o{ role : "role_id"
    user_role ||--o{ user : "granted_by"
    contact ||--o{ account : "account_id"
    deal ||--o{ account : "account_id"
    deal ||--o{ user : "owner_user_id"
    deal ||--o{ org_unit : "org_unit_id"
    deal_contact ||--o{ deal : "deal_id"
    deal_contact ||--o{ contact : "contact_id"
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
    rubric ||--o{ rubric_theme : "rubric_theme_id"
    rubric_parameter ||--o{ rubric : "rubric_id"
    scorecard ||--o{ activity : "activity_id"
    scorecard ||--o{ user : "owner_user_id"
    scorecard ||--o{ rubric : "rubric_id"
    scorecard_line ||--o{ scorecard : "scorecard_id"
    scorecard_line ||--o{ rubric_parameter : "rubric_parameter_id"
    score_override ||--o{ scorecard_line : "scorecard_line_id"
    score_override ||--o{ user : "created_by"
    product_signal ||--o{ post_call : "post_call_id"
    product_signal ||--o{ deal : "deal_id"
    product_signal ||--o{ account : "account_id"
    product_signal ||--o{ user : "owner_user_id"
    product_signal ||--o{ user : "reviewed_by"
    product_signal ||--o{ signal_cluster : "cluster_id"
    coaching_focus ||--o{ user : "se_user_id"
    coaching_focus ||--o{ user : "set_by_user_id"
    coaching_focus ||--o{ rubric_theme : "rubric_theme_id"
    coaching_reflection ||--o{ user : "se_user_id"
    coaching_reflection ||--o{ coaching_focus : "coaching_focus_id"
    coaching_reflection ||--o{ activity : "activity_id"
    coaching_recommendation ||--o{ user : "se_user_id"
    coaching_recommendation ||--o{ rubric_theme : "rubric_theme_id"
    sync_job ||--o{ integration : "integration_id"
    webhook_event ||--o{ integration : "integration_id"
    ai_run ||--o{ activity : "activity_id"
    audit_log ||--o{ user : "user_id"
```