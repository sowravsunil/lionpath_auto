# `table-score_override.md` — score_override  (domain: Scoring)

Focused local-context view of the **score_override** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    score_override {
        bigint id PK
        bigint scorecard_line_id FK
        numeric previous_score
        numeric new_score
        text reason
        bigint created_by FK
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

    scorecard_line ||--o{ score_override : "scorecard_line_id"
    user ||--o{ score_override : "created_by"
```

## Relationships

**Outbound (this table → target via column):**
- `score_override.scorecard_line_id` → `scorecard_line.id` (N:1)
- `score_override.created_by` → `user.id` (N:1)

## Notes

Append-only dispute of a scorecard_line score.
