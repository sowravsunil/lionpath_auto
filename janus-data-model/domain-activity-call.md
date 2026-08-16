# Domain: Activity & Call

Focused ER diagram for the **Activity & Call** domain (5 tables). `activity` is the
hub: `pre_call` and `post_call` are 1:1 extensions, `call_participant` and `task`
are 1:many children.

**Tables:** `activity`, `pre_call`, `post_call`, `call_participant`, `task`

## Internal relationships
- `pre_call` → `activity` (activity_id, **1:1**)
- `pre_call` → `deal` (deal_id) — cross-domain
- `post_call` → `activity` (activity_id, **1:1**)
- `post_call` → `deal` (deal_id) — cross-domain
- `call_participant` → `activity` (activity_id)
- `call_participant` → `contact` (contact_id) — cross-domain
- `task` → `activity` (activity_id)
- `task` → `deal` (deal_id) — cross-domain
- `task` → `user` (owner_user_id) — cross-domain

## Cross-domain relationships
- `activity.deal_id` → `deal` (Customer)
- `activity.account_id` → `account` (Customer)
- `activity.owner_user_id` → `user` (Identity & Org)
- `activity.org_unit_id` → `org_unit` (Identity & Org)
- `activity.source_integration` → `integration` (Integration)
- `activity` is referenced by: `scorecard.activity_id` (1:1),
  `coaching_reflection.activity_id`, `ai_run.activity_id`
- `post_call` is referenced by: `product_signal.post_call_id`

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
    pre_call {
        bigint id PK
        bigint activity_id FK "1:1"
        bigint deal_id FK
        jsonb research_brief
        jsonb input_snapshot
        timestamptz generated_at
        timestamptz created_at
    }
    post_call {
        bigint id PK
        bigint activity_id FK "1:1"
        bigint deal_id FK
        text transcript_ref
        jsonb analysis
        jsonb detail
        timestamptz created_at
        timestamptz updated_at
    }
    call_participant {
        bigint id PK
        bigint activity_id FK
        bigint contact_id FK
        text participant_role
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

    activity ||--|| pre_call : "activity_id (1:1)"
    activity ||--|| post_call : "activity_id (1:1)"
    activity ||--o{ call_participant : "activity_id"
    activity ||--o{ task : "activity_id"
    %% cross-domain (drawn for completeness)
    activity }o--|| deal : "deal_id"
    activity }o--|| account : "account_id"
    activity }o--|| user : "owner_user_id"
    activity }o--|| org_unit : "org_unit_id"
    activity }o--|| integration : "source_integration"
    pre_call }o--|| deal : "deal_id"
    post_call }o--|| deal : "deal_id"
    call_participant }o--|| contact : "contact_id"
    task }o--|| deal : "deal_id"
    task }o--|| user : "owner_user_id"
```

## Notes
- The two **1:1** relations (`pre_call`, `post_call` to `activity`) are enforced via
  a unique constraint on the FK column plus a NOT NULL — i.e. the child row cannot
  outlive its parent and there is at most one per activity.
- `activity.source_integration` is the only place an activity is tied back to an
  integration row (e.g. "came from Zoom sync"). Nullable for manually-created
  activities.
- `task` is an offshoot of `activity` (action items captured during/after a call)
  but also denormalises `deal_id` + `owner_user_id` for fast query scoping.