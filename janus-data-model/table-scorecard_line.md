# `table-scorecard_line.md` — scorecard_line  (domain: Scoring)

Focused local-context view of the **scorecard_line** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    scorecard_line {
        bigint id PK
        bigint scorecard_id FK
        bigint rubric_parameter_id FK
        numeric score
        text evidence
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
    score_override {
        bigint id PK
        bigint scorecard_line_id FK
        numeric previous_score
        numeric new_score
        text reason
        bigint created_by FK
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

    scorecard ||--o{ scorecard_line : "scorecard_id"
    rubric_parameter ||--o{ scorecard_line : "rubric_parameter_id"
    scorecard_line ||--o{ score_override : "scorecard_line_id"
```

## Relationships

**Outbound (this table → target via column):**
- `scorecard_line.scorecard_id` → `scorecard.id` (N:1)
- `scorecard_line.rubric_parameter_id` → `rubric_parameter.id` (N:1)

**Inbound (source → this table via column):**
- `score_override.scorecard_line_id` → `scorecard_line.id` (1:N)

## Notes

One parameter's score on a scorecard (75 per call).
