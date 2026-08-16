# Janus Data Model — Integration

```mermaid
erDiagram
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

    activity ||--o{ integration : "source_integration"
    sync_job ||--o{ integration : "integration_id"
    webhook_event ||--o{ integration : "integration_id"
```