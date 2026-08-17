# `table-user_identity.md` — user_identity  (domain: Identity & Org)

Focused local-context view of the **user_identity** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    user_identity {
        bigint id PK
        bigint user_id FK
        text auth_provider
        text auth_uid
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

    user ||--o{ user_identity : "user_id"
```

## Relationships

**Outbound (this table → target via column):**
- `user_identity.user_id` → `user.id` (N:1)

## Notes

Auth provider binding (firebase/google_sso) for a user.
