# `table-rubric_theme.md` — rubric_theme  (domain: Scoring)

Focused local-context view of the **rubric_theme** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    rubric_theme {
        bigint id PK
        text name
        text description
        int display_order
        text status
        timestamptz created_at
    }
    coaching_focus {
        bigint id PK
        bigint se_user_id FK
        bigint set_by_user_id FK
        bigint rubric_theme_id FK
        text description
        text target
        text status
        date timeframe_start
        date timeframe_end
        timestamptz created_at
        timestamptz updated_at
    }
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

    rubric_theme ||--o{ rubric : "rubric_theme_id"
    rubric_theme ||--o{ coaching_focus : "rubric_theme_id"
    rubric_theme ||--o{ coaching_recommendation : "rubric_theme_id"
```

## Relationships

**Inbound (source → this table via column):**
- `rubric.rubric_theme_id` → `rubric_theme.id` (1:N)
- `coaching_focus.rubric_theme_id` → `rubric_theme.id` (1:N)
- `coaching_recommendation.rubric_theme_id` → `rubric_theme.id` (1:N)

## Notes

Top level of scoring (5 themes).
