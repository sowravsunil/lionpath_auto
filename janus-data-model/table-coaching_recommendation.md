# `table-coaching_recommendation.md` — coaching_recommendation  (domain: Coaching)

Focused local-context view of the **coaching_recommendation** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    coaching_recommendation {
        bigint id PK
        bigint se_user_id FK
        bigint rubric_theme_id FK
        text recommendation_text
        text evidence_summary
        text status
        timestamptz generated_at
        timestamptz dismissed_at
    }
    rubric_theme {
        bigint id PK
        text name
        text description
        int display_order
        text status
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

    user ||--o{ coaching_recommendation : "se_user_id"
    rubric_theme ||--o{ coaching_recommendation : "rubric_theme_id"
```

## Relationships

**Outbound (this table → target via column):**
- `coaching_recommendation.se_user_id` → `user.id` (N:1)
- `coaching_recommendation.rubric_theme_id` → `rubric_theme.id` (N:1)

## Notes

System-generated coaching recommendation.
