# `table-rubric.md` — rubric  (domain: Scoring)

Focused local-context view of the **rubric** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    rubric_parameter {
        bigint id PK
        bigint rubric_id FK
        text name
        text description
        numeric weight
        int display_order
        timestamptz created_at
    }
    rubric_theme {
        bigint id PK
        text name
        text description
        int display_order
        text status
        timestamptz created_at
    }
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

    rubric_theme ||--o{ rubric : "rubric_theme_id"
    rubric ||--o{ rubric_parameter : "rubric_id"
    rubric ||--o{ scorecard : "rubric_id"
```

## Relationships

**Outbound (this table → target via column):**
- `rubric.rubric_theme_id` → `rubric_theme.id` (N:1)

**Inbound (source → this table via column):**
- `rubric_parameter.rubric_id` → `rubric.id` (1:N)
- `scorecard.rubric_id` → `rubric.id` (1:N)

## Notes

A versioned rubric under a theme.
