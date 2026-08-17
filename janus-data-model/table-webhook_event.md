# `table-webhook_event.md` — webhook_event  (domain: Integration)

Focused local-context view of the **webhook_event** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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

    integration ||--o{ webhook_event : "integration_id"
```

## Relationships

**Outbound (this table → target via column):**
- `webhook_event.integration_id` → `integration.id` (N:1)

## Notes

A received webhook payload with processing status.
