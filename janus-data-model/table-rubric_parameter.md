# `table-rubric_parameter.md` — rubric_parameter  (domain: Scoring)

Focused local-context view of the **rubric_parameter** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    rubric_parameter {
        bigint id PK
        bigint rubric_id FK
        text name
        text description
        numeric weight
        int display_order
        timestamptz created_at
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
    scorecard_line {
        bigint id PK
        bigint scorecard_id FK
        bigint rubric_parameter_id FK
        numeric score
        text evidence
        timestamptz created_at
    }

    rubric ||--o{ rubric_parameter : "rubric_id"
    rubric_parameter ||--o{ scorecard_line : "rubric_parameter_id"
```

## Relationships

**Outbound (this table → target via column):**
- `rubric_parameter.rubric_id` → `rubric.id` (N:1)

**Inbound (source → this table via column):**
- `scorecard_line.rubric_parameter_id` → `rubric_parameter.id` (1:N)

## Notes

A scored evaluation statement under a rubric (75 total).
