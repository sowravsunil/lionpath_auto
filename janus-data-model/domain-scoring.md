# Domain: Scoring

Focused ER diagram for the **Scoring** domain (6 tables). Two parallel trees share
the `rubric_theme` root: the rubric definition chain (`rubric_theme → rubric →
rubric_parameter`) and the scoring chain (`scorecard → scorecard_line →
score_override`). `scorecard` is 1:1 with `activity`.

**Tables:** `rubric_theme`, `rubric`, `rubric_parameter`, `scorecard`,
`scorecard_line`, `score_override`

## Internal relationships
- `rubric` → `rubric_theme` (rubric_theme_id)
- `rubric_parameter` → `rubric` (rubric_id)
- `scorecard_line` → `scorecard` (scorecard_id)
- `scorecard_line` → `rubric_parameter` (rubric_parameter_id)
- `score_override` → `scorecard_line` (scorecard_line_id)

## Cross-domain relationships
- `scorecard.activity_id` → `activity` (**1:1**)
- `scorecard.owner_user_id` → `user` (Identity & Org)
- `scorecard.rubric_id` → `rubric` (internal)
- `score_override.created_by` → `user` (Identity & Org)
- `rubric_theme` is referenced by: `coaching_focus.rubric_theme_id`,
  `coaching_recommendation.rubric_theme_id` (both Coaching domain)

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
    rubric {
        bigint id PK
        bigint rubric_theme_id FK
        text name
        text description
        int version
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
    scorecard {
        bigint id PK
        bigint activity_id FK "1:1"
        bigint owner_user_id FK
        bigint rubric_id FK
        numeric composite_score
        boolean se_camera
        boolean customer_camera
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
    score_override {
        bigint id PK
        bigint scorecard_line_id FK
        numeric previous_score
        numeric new_score
        text reason
        bigint created_by FK
        timestamptz created_at
    }

    rubric_theme ||--o{ rubric : "rubric_theme_id"
    rubric ||--o{ rubric_parameter : "rubric_id"
    scorecard ||--o{ scorecard_line : "scorecard_id"
    rubric_parameter ||--o{ scorecard_line : "rubric_parameter_id"
    scorecard_line ||--o{ score_override : "scorecard_line_id"
    %% cross-domain
    activity ||--|| scorecard : "activity_id (1:1)"
    user ||--o{ scorecard : "owner_user_id"
    user ||--o{ score_override : "created_by"
    rubric ||--o{ scorecard : "rubric_id"
```

## Notes
- A `scorecard` is created exactly once per `activity` (1:1, enforced by a unique
  constraint on `activity_id`). It is the persisted evaluation of one call against
  one `rubric`.
- Each `scorecard_line` is one row per `rubric_parameter` — the join of those two
  tables gives you the parameter name + weight alongside the score.
- `score_override` is an append-only audit trail: never updates `scorecard_line`
  in place; a new row records `previous_score → new_score` plus `reason` and the
  `created_by` user. This preserves the full history of human corrections.
- `rubric.effective_from / effective_to` allow versioned rubrics to coexist; a
  scorecard pins a specific `rubric_id` so historical scores stay comparable.