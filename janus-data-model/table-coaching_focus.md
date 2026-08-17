# `table-coaching_focus.md` — coaching_focus  (domain: Coaching)

Focused local-context view of the **coaching_focus** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    coaching_reflection {
        bigint id PK
        bigint se_user_id FK
        bigint coaching_focus_id FK
        bigint activity_id FK
        text reflection_text
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

    user ||--o{ coaching_focus : "se_user_id"
    user ||--o{ coaching_focus : "set_by_user_id"
    rubric_theme ||--o{ coaching_focus : "rubric_theme_id"
    coaching_focus ||--o{ coaching_reflection : "coaching_focus_id"
```

## Relationships

**Outbound (this table → target via column):**
- `coaching_focus.se_user_id` → `user.id` (N:1)
- `coaching_focus.set_by_user_id` → `user.id` (N:1)
- `coaching_focus.rubric_theme_id` → `rubric_theme.id` (N:1)

**Inbound (source → this table via column):**
- `coaching_reflection.coaching_focus_id` → `coaching_focus.id` (1:N)

## Notes

Manager-set focus area for an SE.
