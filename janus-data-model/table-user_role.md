# `table-user_role.md` — user_role  (domain: Identity & Org)

Focused local-context view of the **user_role** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    user_role {
        bigint user_id FK
        bigint role_id FK
        date valid_from
        date valid_to
        bigint granted_by FK
        timestamptz created_at
    }
    role {
        bigint id PK
        text name
        text description
        text role_type
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

    user ||--o{ user_role : "user_id"
    role ||--o{ user_role : "role_id"
    user ||--o{ user_role : "granted_by"
```

## Relationships

**Outbound (this table → target via column):**
- `user_role.user_id` → `user.id` (N:1)
- `user_role.role_id` → `role.id` (N:1)
- `user_role.granted_by` → `user.id` (N:1)

## Notes

Effective-dated many-to-many between user and role.
