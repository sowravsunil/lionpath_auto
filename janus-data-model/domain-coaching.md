# Janus Data Model — Coaching

```mermaid
erDiagram
    coaching_focus {
        id PK
        se_user_id FK
        set_by_user_id FK
        rubric_theme_id FK
        description
        target
        status
        timeframe_start
        timeframe_end
        created_at
        updated_at
    }
    coaching_reflection {
        id PK
        se_user_id FK
        coaching_focus_id FK
        activity_id FK
        reflection_text
        created_at
    }
    coaching_recommendation {
        id PK
        se_user_id FK
        rubric_theme_id FK
        recommendation_text
        evidence_summary
        status
        generated_at
        dismissed_at
    }

    coaching_focus ||--o{ user : "se_user_id"
    coaching_focus ||--o{ user : "set_by_user_id"
    coaching_focus ||--o{ rubric_theme : "rubric_theme_id"
    coaching_reflection ||--o{ user : "se_user_id"
    coaching_reflection ||--o{ coaching_focus : "coaching_focus_id"
    coaching_reflection ||--o{ activity : "activity_id"
    coaching_recommendation ||--o{ user : "se_user_id"
    coaching_recommendation ||--o{ rubric_theme : "rubric_theme_id"
```