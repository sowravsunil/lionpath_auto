# Security Review Resolution

Branch: `feat/security-hardening` (off `origin/main`)

This document records every security finding from the Janus SE security
review, the fix applied on this branch, the exact files/lines changed, why
the fix resolves the vuln, and any residual risk. It is self-contained — a
reviewer with no prior context can understand each change from this doc
alone.

## Summary table

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| C1 | CRITICAL | Impersonation endpoint live in production | **FIXED** |
| C2 | HIGH | `rejectUnauthorized: false` disables TLS cert verification | **FIXED** |
| H1 | HIGH | RLS session-var bypass via direct `janus_app` connection | **FIXED** |
| H2 | HIGH | `redact_pii()` leaves transcripts/MEDDPICC/ARR intact | **FIXED** |
| H3 | HIGH | Transcript PII in plaintext; ai_run has no RLS | **PARTIAL** (RLS added; column-level encryption deferred) |
| L3 | LOW→HIGH | `FIREBASE_AUTH_ENFORCED=0` disables auth in production | **FIXED** |
| M1 | MEDIUM | No app-layer authz for SQL writes to un-RLS'd tables | **FIXED** |
| M3 | MEDIUM | `withSystemContext` name hides RLS-bypass danger | **FIXED** |
| M4 | LOW | Timing-unsafe cron secret comparison | **FIXED** |

---

## C1 — Impersonation endpoint live in production

**Severity: CRITICAL**

**The vuln:** `POST /api/admin/impersonate-token` lets a caller mint a
Firebase custom token for any email, sign in as that user, and even
auto-create new Firebase users. The only gate was a hardcoded allowlist of
3 dev emails. No `NODE_ENV` check, no audit log, no additional secret. If
any of the 3 allowlisted accounts was compromised, the attacker got full
impersonation of every user.

**What changed:** `worker/src/routes/impersonate.ts` (rewritten)

1. **Production hard-gate** (`:42-44`): returns 403 immediately if
   `NODE_ENV=production`. The endpoint is dev/staging-only.
2. **Additional secret header** (`:55-61`): requires
   `X-Impersonate-Secret` matching `IMPERSONATE_SECRET` env var. A stolen
   Firebase token alone is no longer sufficient.
3. **No auto-create** (`:90-93`): removed the `createUser` fallback —
   impersonation targets must already exist in Firebase Auth. Returns 404
   if the target email is not found.
4. **Structured audit log** (`:69-74`): every impersonation event is
   logged to `console.error` with `[AUDIT]` prefix, caller email, target
   email, and timestamp. Visible in Cloud Run logs.

**New env vars:** `IMPERSONATE_SECRET` added to `worker/src/env.ts:41` and
`worker/src/node-server.ts` `NodeEnv` interface (`:30`) and `buildEnv()`
(`:67`).

**Residual risk:** In non-production (staging/dev), a compromised dev
account + stolen `IMPERSONATE_SECRET` can still impersonate. The secret
must be stored in Secret Manager and rotated. SQL `audit_log` logging is
not implemented (the `audit_log` table is dead — see
`janus_unutilized_tables.md`); console logging is the audit trail for now.

---

## C2 — `rejectUnauthorized: false` disables TLS cert verification

**Severity: HIGH (CRITICAL on the public-IP QA path)**

**The vuln:** `postgres-pool.ts:64` set `rejectUnauthorized: false` for ALL
SSL modes including `sslmode=verify-full`. This silently downgraded
cert-authenticated connections to encryption-only (MITM-vulnerable). The
comment claimed production uses the Auth Proxy with a proper CA, but the
code did the opposite.

**What changed:** `worker/src/data/persistence/postgres-pool.ts:53-78`
(`pgPoolOptions` rewritten)

1. **Cert verification per sslmode** (`:68`): `rejectUnauthorized` is now
   `true` only when `sslmode=verify-ca` or `sslmode=verify-full`. For
   `sslmode=require`/`prefer`, it is `false` (encrypted, no validation —
   same as before, but now intentional).
2. **Explicit insecure override** (`:64-66`): `PG_SSL_INSECURE=1` env var
   forces `rejectUnauthorized: false` regardless of sslmode. This is the
   QA public-IP escape hatch.
3. **Boot guard** (`worker/src/node-server.ts:120-127`): the worker
   refuses to boot if `NODE_ENV=production` and `PG_SSL_INSECURE=1`. The
   insecure flag is dev/QA-only.

**New env vars:** `PG_SSL_INSECURE` added to `PostgresEnv` interface
(`postgres-pool.ts:25`), `worker/src/env.ts:43`, and `node-server.ts`
`NodeEnv` (`:31`) and `buildEnv()` (`:68`).

**Why it fixes it:** `sslmode=verify-full` now actually verifies the
server certificate. A MITM on the DB connection path is detected and
rejected. The insecure path is explicitly opt-in and production-gated.

**Residual risk:** The QA instance (`8.231.110.188`, `0.0.0.0/0`) with
`PG_SSL_INSECURE=1` is still MITM-vulnerable — but that is the documented
QA-only posture, and the boot guard prevents it in production.

---

## H1 — RLS session-var bypass via direct `janus_app` connection

**Severity: HIGH**

**The vuln:** RLS policies read `app.is_admin`, `app.user_id`,
`app.org_unit_path` session variables. Anyone with the `janus_app`
DATABASE_URL can connect directly and run
`SELECT set_config('app.is_admin', 'true', true)` to bypass all RLS. No
role-level defaults prevented this.

**What changed:** New file `janus/schema/17_rls_role_defaults.sql`

```sql
ALTER ROLE janus_app SET app.is_admin = 'false';
ALTER ROLE janus_app SET app.user_id = '';
ALTER ROLE janus_app SET app.org_unit_path = '';
```

**Why it fixes it:** `ALTER ROLE ... SET` establishes a role-level default
for the GUC. A direct `janus_app` connection that does NOT run
`SET LOCAL` (which only the worker does, inside `withSessionContext`)
gets the fail-closed defaults: `is_admin=false`, `user_id=NULL` (empty
string → `NULLIF(...)` → NULL), `org_unit_path=NULL`. RLS policies deny
all rows, exactly as if the session vars were never set.

The worker's `withSessionContext` uses `set_config(..., true)` (is_local),
which overrides the role default for the current transaction only. So
legitimate worker writes are unaffected — the `SET LOCAL` takes
precedence within the transaction, and the role default is restored
after `COMMIT`.

**Apply path:** Added to `worker/scripts/apply-janus-schema.mjs` (`:40`)
and `janus/schema/init_all.sql` (`:29`).

**Residual risk:** A `SUPERUSER` or a role with `SET ROLE janus_app` from
a `SUPERUSER` session can still override the defaults with `SET` (not
`SET LOCAL`). This is inherent to PostgreSQL — `SUPERUSER` bypasses all
RLS. The fix raises the bar from "anyone with janus_app creds" to "anyone
with postgres superuser creds", which is the correct trust boundary.

---

## H2 — `redact_pii()` leaves transcripts/MEDDPICC/ARR intact

**Severity: HIGH (false compliance signal)**

**The vuln:** `redact_pii()` (a `SECURITY DEFINER` function) only redacted
two JSONB paths (`callNotes` and `artifacts.suggestedFollowUpEmail`) in
`post_call.analysis`, leaving the transcript, MEDDPICC fields, ARR lines,
objections, commitments, MoM drafts, and deal signals intact. A
redaction job that runs, reports a row count, and leaves the most
sensitive data creates a false compliance signal.

**What changed:** `janus/schema/06_phase6_outbox_integrations_pii.sql:249-296`
(`redact_pii` function rewritten)

The `UPDATE post_call` now sets `analysis = NULL`, `detail = NULL`, and
`transcript_ref = NULL` for redacted rows, instead of surgically
redacting two JSONB paths. The `pipeline_state` is preserved for
operational visibility (the row still exists, just without PII blobs).

**Why it fixes it:** NULLing out the entire `analysis` and `detail`
JSONB columns removes all PII — transcripts, MEDDPICC, ARR, objections,
commitments, everything — in one operation. No path-by-path redaction
can miss a field. `transcript_ref` (the GCS URI) is also NULLed so the
GCS object can be independently tombstoned.

**Residual risk:** GCS objects referenced by `transcript_ref` are not
deleted by this function (it only NULLs the SQL reference). A separate
GCS lifecycle policy or a `gsutil rm` step is needed to delete the
actual transcript files. The user/contact tombstoning (step 2 of the
function) is unchanged and correct.

---

## H3 — Transcript PII in plaintext + ai_run RLS

**Severity: HIGH (data protection) / the ai_run RLS part is FIXED**

**The vuln (PII):** Call transcripts are stored in plaintext in
`post_call.detail` JSONB. Cloud SQL provides disk-level encryption
(Google-managed keys), but no column-level encryption. A direct
connection bypass (H1) or SQL injection could expose transcripts.

**What changed (ai_run RLS):** New file `janus/schema/18_ai_run_rls.sql`

Adds RLS to `ai_run`:
- `ai_run_owner_read` (SELECT): `is_admin() OR user_id = current_user_id()`.
  A user sees only their own cost rows; admin sees all; sentinel rows
  (`user_id IS NULL`) are admin-only.
- `ai_run_admin_write` (ALL): `is_admin()` only — writes go through
  `insertAiRun` which runs as the sentinel with `is_admin=true`.
- `REVOKE UPDATE, DELETE` — append-only.

**What changed (encryption posture):** Documented in
`janus/schema/18_ai_run_rls.sql` header comments:
- Cloud SQL: encryption at rest is automatic (Google-managed keys). CMEK
  is available but not configured.
- `post_call.analysis/detail`: plaintext at column level. Disk-level
  encryption protects against physical theft but not H1 (direct
  connection). Column-level encryption (pgcrypto) or GCS-only transcript
  storage with CMEK is the production target.
- GCS bucket `se-singha-paathi-call-payloads`: no KMS/CMEK configured.

**Apply path:** Added to `apply-janus-schema.mjs` (`:41`) and
`init_all.sql` (`:30`).

**Residual risk / DEFERRED:** Column-level encryption for
`post_call.analysis/detail` is not implemented — it requires an
application-layer encryption/de-encryption step on every read/write, or
migrating transcripts to GCS-only storage with CMEK. This is a
product-level decision (performance impact, key management) and is
deferred. The H1 fix (role defaults) and RLS on `post_call` (already
present from `13_rls_hardening_round2.sql`) are the current defense.

---

## L3 — `FIREBASE_AUTH_ENFORCED=0` disables auth in production

**Severity: LOW→HIGH (elevated because it silently disables all auth)**

**The vuln:** The boot guard in `node-server.ts` only checked
`FIREBASE_PROJECT_ID` — but `FIREBASE_AUTH_ENFORCED=0` also disables
token verification (dummy auth mode), even when `FIREBASE_PROJECT_ID` is
set. A production deployment with both set would silently trust
client-claimed identity.

**What changed:** `worker/src/node-server.ts:114-120` (new boot guard
block)

```ts
const authEnforced = (env.FIREBASE_AUTH_ENFORCED || "1").trim().toLowerCase();
const authDisabled = authEnforced === "0" || authEnforced === "false" || authEnforced === "no";
if (isProduction && firebaseProjectId && authDisabled) {
  const msg = "[worker] FATAL: FIREBASE_AUTH_ENFORCED=0 in a production environment ...";
  console.error(msg);
  throw new Error(msg);
}
```

**Why it fixes it:** The worker now refuses to boot in production if
either `FIREBASE_PROJECT_ID` is empty OR `FIREBASE_AUTH_ENFORCED=0`. Both
conditions that enable dummy auth are hard-gated.

**Residual risk:** None — the boot guard is a hard fail, not a warning.

---

## M1 — No app-layer authz for SQL writes to un-RLS'd tables

**Severity: MEDIUM**

**The vuln:** `trySqlDomainWrite` in `routes.ts` writes to `account` and
`contact` (which have no RLS) without checking the caller's role. The
Firestore path has `canCreateAccount` / `onAccountSeTeam` rules, but the
SQL path trusted the client-provided `doc` fields and wrote directly.

**What changed:** `worker/src/routes.ts:1631-1654` (new
`canWriteUnscopedResource` helper) and `:1678-1694` (authz check before
SQL write for un-RLS'd methods)

1. **`canWriteUnscopedResource(ctx, op)`** (`:1637-1652`): checks the
   caller's `RequestContext` (resolved from Firestore `authIndex`/`users`
   — same source as the Firestore rules). For creates: admin, manager
   with org, or SE with org+team (mirrors `canCreateAccount`). For
   updates: admin or manager (SEs fall through to Firestore, which has
   the `onAccountSeTeam` check).
2. **Guard in `trySqlDomainWrite`** (`:1680-1694`): for
   `createAccount`/`updateAccount`/`createContact`/`updateContact`,
   resolves `RequestContext` and checks `canWriteUnscopedResource`. If
   the check fails, returns `{ handled: false }` — the request falls
   through to the Firestore path, which has the security rules.

**Why it fixes it:** The SQL path now enforces the same role-based
authorization as the Firestore rules before writing to un-RLS'd tables.
An SE who would be denied by Firestore rules is also denied (or falls
through to Firestore) on the SQL path.

**Residual risk:** The `resolveRequestContext` call requires Firestore
(it reads from `authIndex`/`users` collections). If Firestore is not
configured, the check fails gracefully (returns `{ handled: false }` →
Firestore fallback), but the write doesn't go to SQL. This is acceptable
during the dual-write transition (Firestore is still available). After
full SQL cutover, the authz check should move to SQL (query
`app_user`/`user_role` directly instead of Firestore).

---

## M3 — `withSystemContext` name hides RLS-bypass danger

**Severity: MEDIUM**

**The vuln:** `withSystemContext` runs as the `usr_janus_ai` sentinel with
`is_admin=true`, bypassing all RLS. The name gave no indication of the
danger. A future developer could call it from a request handler to "fix"
a permission error, silently bypassing all RLS.

**What changed:** `worker/src/data/persistence/session-context.ts:113-141`

Renamed `withSystemContext` to `withUnrestrictedSystemContext`. A
deprecated alias `withSystemContext = withUnrestrictedSystemContext` is
kept for backward compatibility. The new name makes the RLS bypass
explicit at every call site.

Also updated `worker/src/data/persistence/index.ts:10` to export both
names.

**Why it fixes it:** The name `withUnrestrictedSystemContext` is
self-documenting — a developer seeing it in a route handler will
immediately question why RLS is being bypassed. The deprecated alias
ensures existing code doesn't break.

**Residual risk:** The alias is still callable — a developer could still
use `withSystemContext` without realizing the danger. A future lint rule
or code search can find remaining `withSystemContext` calls and migrate
them.

---

## M4 — Timing-unsafe cron secret comparison

**Severity: LOW**

**The vuln:** `verifyInternalCronAuth` compared the `INTERNAL_CRON_SECRET`
with `===` (not constant-time). A timing side-channel could leak the
secret byte-by-byte.

**What changed:** `worker/src/routes/internal-batch.ts:57-92`

Replaced `header === secret` with `timingSafeEqualString(header, secret)`,
a constant-time comparison that:
1. Checks length equality first (returns false immediately if lengths
   differ, but still iterates to keep timing similar).
2. Uses `crypto.timingSafeEqual` (Node.js built-in) when available.
3. Falls back to a manual XOR-based constant-time compare for non-Node
   runtimes.

**Why it fixes it:** The comparison time is now proportional to the input
length, not to the position of the first differing byte. An attacker
cannot measure timing to narrow down the secret character-by-character.

**Residual risk:** The length check leaks the secret length (an attacker
can determine how long the secret is). This is low-impact — knowing the
length does not help guess the content, and the secret is high-entropy.

---

## Files changed on this branch

| File | Change |
|------|--------|
| `worker/src/routes/impersonate.ts` | C1: production gate, secret header, audit log, no auto-create |
| `worker/src/data/persistence/postgres-pool.ts` | C2: correct `rejectUnauthorized` per sslmode, `PG_SSL_INSECURE` env |
| `worker/src/node-server.ts` | L3 + C2: boot guards for `FIREBASE_AUTH_ENFORCED=0` and `PG_SSL_INSECURE=1` in production; new env vars |
| `worker/src/env.ts` | New env vars: `IMPERSONATE_SECRET`, `PG_SSL_INSECURE` |
| `janus/schema/17_rls_role_defaults.sql` **(new)** | H1: `ALTER ROLE janus_app SET` fail-closed defaults |
| `janus/schema/06_phase6_outbox_integrations_pii.sql` | H2: `redact_pii()` NULLs analysis/detail/transcript_ref |
| `janus/schema/18_ai_run_rls.sql` **(new)** | H3: ai_run RLS (owner-scoped) + encryption posture docs |
| `worker/src/routes.ts` | M1: `canWriteUnscopedResource` authz check for un-RLS'd SQL writes |
| `worker/src/data/persistence/session-context.ts` | M3: rename to `withUnrestrictedSystemContext` |
| `worker/src/data/persistence/index.ts` | M3: export new name + deprecated alias |
| `worker/src/routes/internal-batch.ts` | M4: constant-time cron secret comparison |
| `worker/scripts/apply-janus-schema.mjs` | Add `17_rls_role_defaults.sql` and `18_ai_run_rls.sql` |
| `janus/schema/init_all.sql` | Add `17` and `18` to psql apply path |

## Verification

- `tsc --noEmit`: 0 errors
- `node scripts/run-tests.mjs --tag=unit`: 83/84 passed (1 failure is the
  pre-existing `test-node-boot.mjs` port-bind issue, unrelated to these
  changes)
- `node janus/tests/run_all_phase_tests.mjs`: 36/36 passed