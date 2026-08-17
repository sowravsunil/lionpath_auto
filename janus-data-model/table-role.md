# `table-role.md` — role  (domain: Identity & Org)

Focused local-context view of the **role** table and its immediate FK neighbors.

## Mini ER diagram

```mermaid
erDiagram
    role {
        bigint id PK
        text name
        text description
        text role_type
        timestamptz created_at
    }
    user_role {
        bigint user_id FK
        bigint role_id FK
        date valid_from
        date valid_to
        bigint granted_by FK
        timestamptz created_at
    }

    role ||--o{ user_role : "role_id"
```

## Relationships

**Inbound (source → this table via column):**
- `user_role.role_id` → `role.id` (1:N)

## Notes

A permission or job-function role.
