# `table-coaching_reflection.md` — coaching_reflection  (domain: Coaching)

Focused local-context view of the **coaching_reflection** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    coaching_reflection {
        bigint id PK
        bigint se_user_id FK
        bigint coaching_focus_id FK
        bigint activity_id FK
        text reflection_text
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

    user ||--o{ coaching_reflection : "se_user_id"
    coaching_focus ||--o{ coaching_reflection : "coaching_focus_id"
    activity ||--o{ coaching_reflection : "activity_id"
```

## Relationships

**Outbound (this table → target via column):**
- `coaching_reflection.se_user_id` → `user.id` (N:1)
- `coaching_reflection.coaching_focus_id` → `coaching_focus.id` (N:1)
- `coaching_reflection.activity_id` → `activity.id` (N:1)

## Notes

SE's private self-reflection.
