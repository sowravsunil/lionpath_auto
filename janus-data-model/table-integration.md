# `table-integration.md` — integration  (domain: Integration)

Focused local-context view of the **integration** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    integration {
        bigint id PK
        text provider
        text display_name
        text auth_type
        text credentials_ref
        JSONB config
        text status
        timestamptz last_healthy_at
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
    sync_job {
        bigint id PK
        bigint integration_id FK
        text direction
        text entity_type
        text status
        int records_processed
        int records_failed
        text error_summary
        timestamptz started_at
        timestamptz completed_at
    }
    webhook_event {
        bigint id PK
        bigint integration_id FK
        text event_type
        JSONB payload
        text processing_status
        text linked_entity_type
        bigint linked_entity_id
        timestamptz received_at
        timestamptz processed_at
    }

    integration ||--o{ activity : "source_integration"
    integration ||--o{ sync_job : "integration_id"
    integration ||--o{ webhook_event : "integration_id"
```

## Relationships

**Inbound (source → this table via column):**
- `activity.source_integration` → `integration.id` (1:N)
- `sync_job.integration_id` → `integration.id` (1:N)
- `webhook_event.integration_id` → `integration.id` (1:N)

## Notes

A connected external system (zoom/kaia/salesforce/churnzero).
