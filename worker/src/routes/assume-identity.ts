/**
 * Assume-Identity endpoints — secure admin impersonation for support/debugging.
 *
 * POST /api/admin/assume-identity          — assume a target user's identity
 * POST /api/admin/assume-identity/exit     — exit assume-identity mode
 *
 * Security model (see docs/ASSUME_IDENTITY_DESIGN.md for full design + validation):
 *   - Only real admins (user_role JOIN app_role WHERE name='admin') can assume.
 *     Not an email allowlist — the DB role is the gate.
 *   - The target must be a non-admin (an admin cannot assume another admin's
 *     identity — prevents privilege escalation via assume-identity).
 *   - The minted Firebase custom token carries assume_identity claims with a
 *   15-minute TTL. The worker enforces this TTL on every request (auth.ts).
 *   - The assumed session runs under the TARGET's RLS scope (resolveSqlSession
 *   with the target's Firebase UID) — the admin sees exactly what the target
 *   sees, no more.
 *   - Every assume and exit event is logged to the SQL audit_log table
 *   (append-only, REVOKE UPDATE/DELETE).
 *   - Rate limited: 5 assume requests per minute per admin.
 *   - Every API response from an assumed session includes X-Assume-Identity
 *   headers so the admin is never confused about which identity is active.
 */

import { requireUser, type VerifiedUser, type AssumeIdentityClaims } from "../auth";
import { json } from "../http";
import type { Env } from "../env";
import type { RouteHandler } from "../routes";
import { resolveSqlSession } from "../data/persistence/session-context";
import { insertAuditLog, resolveAppUserIdFromAuthUid } from "../data/audit-log";
import { postgresReady } from "../data/persistence/postgres-pool";
import { checkRateLimit } from "../rate-limit";

/** TTL for an assume-identity session (15 minutes). */
const ASSUME_TTL_MS = 15 * 60 * 1000;

/** Rate limit: 5 assume requests per minute per admin. */
const ASSUME_RATE_LIMIT_PER_MIN = 5;

/** Lockout: 10 failed attempts in 10 minutes → 15-minute lockout. */
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface LockoutEntry {
  failCount: number;
  firstFailAt: number;
  lockedUntil: number;
}
const lockoutMap = new Map<string, LockoutEntry>();

function isLockedOut(adminUid: string): boolean {
  const entry = lockoutMap.get(adminUid);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  // Reset after lockout expires
  if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
    lockoutMap.delete(adminUid);
    return false;
  }
  return false;
}

function recordFailedAttempt(adminUid: string): void {
  const now = Date.now();
  const entry = lockoutMap.get(adminUid);
  if (!entry || now - entry.firstFailAt > LOCKOUT_WINDOW_MS) {
    lockoutMap.set(adminUid, { failCount: 1, firstFailAt: now, lockedUntil: 0 });
    return;
  }
  entry.failCount++;
  if (entry.failCount >= LOCKOUT_THRESHOLD) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.error(`[AUDIT] assume-identity lockout`, { adminUid, failCount: entry.failCount });
  }
}

function clearFailedAttempts(adminUid: string): void {
  lockoutMap.delete(adminUid);
}

function generateSessionId(): string {
  return `asume_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Add X-Assume-Identity headers to a response so the admin is never confused. */
export function addAssumeIdentityHeaders(
  headers: Record<string, string>,
  verified: VerifiedUser,
): Record<string, string> {
  if (!verified.assumeIdentity) return headers;
  return {
    ...headers,
    "X-Assume-Identity": "true",
    "X-Assume-Identity-Target": verified.email,
    "X-Assume-Identity-Expires-At": verified.assumeIdentity.assumeExpiresAt,
  };
}

// ============================================================================
// POST /api/admin/assume-identity
// ============================================================================
export const handleAssumeIdentity: RouteHandler = async (request, env, _url, cors) => {
  if (!firebaseAdminReady(env)) {
    return json({ error: "Assume-identity requires Firebase Auth." }, 503, cors);
  }
  if (!postgresReady(env)) {
    return json({ error: "Assume-identity requires PostgreSQL (role check + audit log)." }, 503, cors);
  }

  const caller = await requireUser(request, env);
  if (!caller) {
    return json({ error: "Sign-in required." }, 401, cors);
  }

  // Rate limit: 5 per minute per admin (stricter than the default 120/min).
  const rateResult = checkRateLimit(
    `assume-identity:${caller.uid}`,
    undefined,
    { RATE_LIMIT_ENABLED: "1", RATE_LIMIT_PER_MINUTE: String(ASSUME_RATE_LIMIT_PER_MIN), RATE_LIMIT_BURST: String(ASSUME_RATE_LIMIT_PER_MIN) } as Env,
  );
  if (rateResult) {
    return json(
      { error: "Too many assume-identity requests. Please wait.", retryAfter: rateResult.retryAfter },
      429,
      { ...cors, "Retry-After": String(rateResult.retryAfter) },
    );
  }

  // Lockout check
  if (isLockedOut(caller.uid)) {
    const entry = lockoutMap.get(caller.uid);
    const retryAfter = entry ? Math.ceil((entry.lockedUntil - Date.now()) / 1000) : 60;
    return json(
      { error: "Assume-identity locked out due to repeated failures.", retryAfter },
      429,
      { ...cors, "Retry-After": String(retryAfter) },
    );
  }

  // Admin role check: resolve the caller's SQL session and verify is_admin.
  const adminSession = await resolveSqlSession(caller.uid, env);
  if (!adminSession) {
    recordFailedAttempt(caller.uid);
    return json({ error: "Your SQL user profile was not found. Migration may be incomplete." }, 403, cors);
  }
  if (!adminSession.isAdmin) {
    recordFailedAttempt(caller.uid);
    return json({ error: "Assume-identity is only available to admins." }, 403, cors);
  }

  const body = (await request.json()) as { targetEmail?: string; reason?: string };
  const targetEmail = String(body.targetEmail || "").trim().toLowerCase();
  const reason = String(body.reason || "").trim();

  if (!targetEmail) {
    recordFailedAttempt(caller.uid);
    return json({ error: "targetEmail is required." }, 400, cors);
  }
  if (reason.length < 10) {
    recordFailedAttempt(caller.uid);
    return json({ error: "reason is required (min 10 chars)." }, 400, cors);
  }

  // Domain restriction
  const domain = (env.ALLOWED_EMAIL_DOMAIN || "").trim().toLowerCase();
  if (domain && !targetEmail.endsWith(`@${domain}`)) {
    recordFailedAttempt(caller.uid);
    return json({ error: `Target must be a @${domain} account.` }, 403, cors);
  }

  // Resolve the target's Firebase user (must already exist — no auto-create).
  let targetUid: string;
  let targetDisplayName: string;
  try {
    const adminMod = await import("firebase-admin");
    const admin = adminMod.default ?? adminMod;
    const targetUser = await admin.auth().getUserByEmail(targetEmail);
    targetUid = targetUser.uid;
    targetDisplayName = targetUser.displayName || targetEmail.split("@")[0];
  } catch {
    recordFailedAttempt(caller.uid);
    return json({ error: `User ${targetEmail} not found in Firebase Auth.` }, 404, cors);
  }

  // V2 fix: the target must NOT be an admin — prevents admin→admin escalation.
  const targetSession = await resolveSqlSession(targetUid, env);
  if (!targetSession) {
    recordFailedAttempt(caller.uid);
    return json({ error: "Target user has no SQL profile (pre-migration)." }, 404, cors);
  }
  if (targetSession.isAdmin) {
    recordFailedAttempt(caller.uid);
    return json({ error: "Cannot assume identity of an admin account." }, 403, cors);
  }

  // Mint the Firebase custom token with assume-identity claims.
  const now = Date.now();
  const expiresAt = new Date(now + ASSUME_TTL_MS).toISOString();
  const assumeSessionId = generateSessionId();

  const claims: AssumeIdentityClaims = {
    assumeIdentity: true,
    assumeSessionId,
    assumeAdminUid: caller.uid,
    assumeAdminEmail: caller.email,
    assumeReason: reason,
    assumeExpiresAt: expiresAt,
  };

  let token: string;
  try {
    const adminMod = await import("firebase-admin");
    const admin = adminMod.default ?? adminMod;
    token = await admin.auth().createCustomToken(targetUid, claims);
  } catch (err) {
    recordFailedAttempt(caller.uid);
    const message = err instanceof Error ? err.message : "Token minting failed.";
    return json({ error: message }, 500, cors);
  }

  // Audit log: record the assume event BEFORE returning the token.
  const adminAppUserId = await resolveAppUserIdFromAuthUid(caller.uid, env);
  if (adminAppUserId) {
    void insertAuditLog(env, {
      userId: adminAppUserId,
      entityType: "assume_identity",
      entityId: assumeSessionId,
      action: "override",
      payload: {
        action_type: "assume",
        admin_email: caller.email,
        admin_uid: caller.uid,
        target_email: targetEmail,
        target_uid: targetUid,
        target_user_id: targetSession.userId,
        reason,
        assume_session_id: assumeSessionId,
        expires_at: expiresAt,
        timestamp: new Date(now).toISOString(),
      },
    });
  }

  clearFailedAttempts(caller.uid);

  return json({
    ok: true,
    token,
    targetUid,
    targetEmail,
    targetDisplayName,
    expiresAt,
    assumeSessionId,
    adminEmail: caller.email,
    warning: "You are now in Assume-Identity mode. All actions are audited.",
  }, 200, cors);
};

// ============================================================================
// POST /api/admin/assume-identity/exit
// ============================================================================
export const handleAssumeIdentityExit: RouteHandler = async (request, env, _url, cors) => {
  if (!firebaseAdminReady(env)) {
    return json({ error: "Assume-identity requires Firebase Auth." }, 503, cors);
  }

  const verified = await requireUser(request, env);
  if (!verified) {
    return json({ error: "Sign-in required." }, 401, cors);
  }
  if (!verified.assumeIdentity) {
    return json({ error: "You are not in an assume-identity session." }, 400, cors);
  }

  const claims = verified.assumeIdentity;
  const now = Date.now();
  const assumeStartedAt = new Date(claims.assumeExpiresAt).getTime() - ASSUME_TTL_MS;
  const durationSeconds = Math.round((now - assumeStartedAt) / 1000);

  // Mint a new custom token for the admin's own UID (restore real session).
  let token: string;
  try {
    const adminMod = await import("firebase-admin");
    const admin = adminMod.default ?? adminMod;
    token = await admin.auth().createCustomToken(claims.assumeAdminUid);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Exit token minting failed.";
    return json({ error: message }, 500, cors);
  }

  // Audit log: record the exit event.
  const adminAppUserId = await resolveAppUserIdFromAuthUid(claims.assumeAdminUid, env);
  if (adminAppUserId) {
    void insertAuditLog(env, {
      userId: adminAppUserId,
      entityType: "assume_identity",
      entityId: claims.assumeSessionId,
      action: "override",
      payload: {
        action_type: "exit",
        admin_email: claims.assumeAdminEmail,
        admin_uid: claims.assumeAdminUid,
        target_email: verified.email,
        target_uid: verified.uid,
        reason: claims.assumeReason,
        assume_session_id: claims.assumeSessionId,
        duration_seconds: durationSeconds,
        timestamp: new Date(now).toISOString(),
      },
    });
  }

  return json({
    ok: true,
    token,
    adminUid: claims.assumeAdminUid,
    adminEmail: claims.assumeAdminEmail,
    assumeSessionId: claims.assumeSessionId,
    durationSeconds,
  }, 200, cors);
};

/** Check if Firebase admin is available (for the assume-identity endpoints). */
function firebaseAdminReady(env: Env): boolean {
  return !!(env.FIREBASE_PROJECT_ID || "").trim() && !!(env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim();
}