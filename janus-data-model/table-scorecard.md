# `table-scorecard.md` — scorecard  (domain: Scoring)

Focused local-context view of the **scorecard** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    scorecard {
        bigint id PK
        bigint activity_id FK
        bigint owner_user_id FK
        bigint rubric_id FK
        numeric composite_score
        text se_camera
        text customer_camera
        timestamptz created_at
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
    rubric {
        bigint id PK
        bigint rubric_theme_id FK
        text name
        text description
        text version
        int display_order
        date effective_from
        date effective_to
        timestamptz created_at
    }
    scorecard_line {
        bigint id PK
        bigint scorecard_id FK
        bigint rubric_parameter_id FK
        numeric score
        text evidence
        timestamptz created_at
    }
    user {
        bigint id PK
        text email "unique"
        text display_name
        text job_title
        text job_level
        bigint org_unit_id FK
        text status
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }

    activity ||--|| scorecard : "activity_id"
    user ||--o{ scorecard : "owner_user_id"
    rubric ||--o{ scorecard : "rubric_id"
    scorecard ||--o{ scorecard_line : "scorecard_id"
```

## Relationships

**Outbound (this table → target via column):**
- `scorecard.activity_id` → `activity.id` (1:1)
- `scorecard.owner_user_id` → `user.id` (N:1)
- `scorecard.rubric_id` → `rubric.id` (N:1)

**Inbound (source → this table via column):**
- `scorecard_line.scorecard_id` → `scorecard.id` (1:N)

## Notes

A scored call, pins the rubric version.
