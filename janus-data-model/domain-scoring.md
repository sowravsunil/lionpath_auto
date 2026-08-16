# Janus Data Model — Scoring

```mermaid
erDiagram
    rubric_theme {
        id PK
        name
        description
        display_order
        status
        created_at
    }
    rubric {
        id PK
        rubric_theme_id FK
        name
        description
        version
        display_order
        effective_from
        effective_to
        created_at
    }
    rubric_parameter {
        id PK
        rubric_id FK
        name
        description
        weight
        display_order
        created_at
    }
    scorecard {
        id PK
        activity_id FK 1:1
        owner_user_id FK
        rubric_id FK
        composite_score
        se_camera
        customer_camera
        created_at
    }
    scorecard_line {
        id PK
        scorecard_id FK
        rubric_parameter_id FK
        score
        evidence
        created_at
    }
    score_override {
        id PK
        scorecard_line_id FK
        previous_score
        new_score
        reason
        created_by FK
        created_at
    }

    rubric ||--o{ rubric_theme : "rubric_theme_id"
    rubric_parameter ||--o{ rubric : "rubric_id"
    scorecard ||--o{ activity : "activity_id"
    scorecard ||--o{ user : "owner_user_id"
    scorecard ||--o{ rubric : "rubric_id"
    scorecard_line ||--o{ scorecard : "scorecard_id"
    scorecard_line ||--o{ rubric_parameter : "rubric_parameter_id"
    score_override ||--o{ scorecard_line : "scorecard_line_id"
    score_override ||--o{ user : "created_by"
    coaching_focus ||--o{ rubric_theme : "rubric_theme_id"
    coaching_recommendation ||--o{ rubric_theme : "rubric_theme_id"
```