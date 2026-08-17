# `table-sync_job.md` — sync_job  (domain: Integration)

Focused local-context view of the **sync_job** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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

    integration ||--o{ sync_job : "integration_id"
```

## Relationships

**Outbound (this table → target via column):**
- `sync_job.integration_id` → `integration.id` (N:1)

## Notes

A sync run record for an integration.
