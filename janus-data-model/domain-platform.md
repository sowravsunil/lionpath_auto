# Janus Data Model — Platform

```mermaid
erDiagram
    ai_run {
        id PK
        activity_id FK
        run_type
        model
        prompt_version
        input_tokens
        output_tokens
        cost_usd
        latency_ms
        created_at
    }
    audit_log {
        id PK
        user_id FK
        entity_type
        entity_id
        action
        payload JSONB
        created_at
    }

    ai_run ||--o{ activity : "activity_id"
    audit_log ||--o{ user : "user_id"
```