# `table-activity.md` — activity  (domain: Activity & Call)

Focused local-context view of the **activity** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
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
    account {
        bigint id PK
        text name
        text domain
        text slug "unique"
        text industry
        JSONB health_data
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }
    ai_run {
        bigint id PK
        bigint activity_id FK
        text run_type
        text model
        text prompt_version
        int input_tokens
        int output_tokens
        numeric cost_usd
        int latency_ms
        timestamptz created_at
    }
    call_participant {
        bigint id PK
        bigint activity_id FK
        bigint contact_id FK
        text participant_role
        timestamptz created_at
    }
    coaching_reflection {
        bigint id PK
        bigint se_user_id FK
        bigint coaching_focus_id FK
        bigint activity_id FK
        text reflection_text
        timestamptz created_at
    }
    deal {
        bigint id PK
        bigint account_id FK
        bigint owner_user_id FK
        bigint org_unit_id FK
        text name
        text stage
        text status
        date close_date
        numeric amount
        JSONB technical_commit
        JSONB meddpicc
        text ai_agent
        text copilot
        text freshcaller
        text other_addons
        text external_ref
        text sync_state
        timestamptz created_at
        timestamptz updated_at
    }
    integration {
        bigint id PK
        text provider
        text display_name
        text auth_type
        text credentials_ref
        JSONB config
        text status
        timestamptz last_healthy_at
        timestamptz created_at
        timestamptz updated_at
    }
    org_unit {
        bigint id PK
        text name
        bigint parent_id FK
        text unit_type
        timestamptz created_at
        timestamptz updated_at
    }
    post_call {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        text transcript_ref
        JSONB analysis
        JSONB detail
        timestamptz created_at
        timestamptz updated_at
    }
    pre_call {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        JSONB research_brief
        JSONB input_snapshot
        timestamptz generated_at
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
    task {
        bigint id PK
        bigint activity_id FK
        bigint deal_id FK
        bigint owner_user_id FK
        text title
        text description
        text status
        date due_date
        text source
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

    deal ||--o{ activity : "deal_id"
    account ||--o{ activity : "account_id"
    user ||--o{ activity : "owner_user_id"
    org_unit ||--o{ activity : "org_unit_id"
    integration ||--o{ activity : "source_integration"
    activity ||--|| pre_call : "activity_id"
    activity ||--|| post_call : "activity_id"
    activity ||--o{ call_participant : "activity_id"
    activity ||--o{ task : "activity_id"
    activity ||--|| scorecard : "activity_id"
    activity ||--o{ coaching_reflection : "activity_id"
    activity ||--o{ ai_run : "activity_id"
```

## Relationships

**Outbound (this table → target via column):**
- `activity.deal_id` → `deal.id` (N:1)
- `activity.account_id` → `account.id` (N:1)
- `activity.owner_user_id` → `user.id` (N:1)
- `activity.org_unit_id` → `org_unit.id` (N:1)
- `activity.source_integration` → `integration.id` (N:1)

**Inbound (source → this table via column):**
- `pre_call.activity_id` → `activity.id` (1:1)
- `post_call.activity_id` → `activity.id` (1:1)
- `call_participant.activity_id` → `activity.id` (1:N)
- `task.activity_id` → `activity.id` (1:N)
- `scorecard.activity_id` → `activity.id` (1:1)
- `coaching_reflection.activity_id` → `activity.id` (1:N)
- `ai_run.activity_id` → `activity.id` (1:N)

## Notes

The spine — every SE action is a row. Call-type gets pre/post 1:1.
