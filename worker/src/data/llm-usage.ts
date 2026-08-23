/**
 * Fire-and-forget LLM usage records for admin cost dashboards.
 *
 * This is the single chokepoint every LLM call site already goes through
 * (the central provider wrapper in providers/index.ts, plus the direct-fetch
 * paths in embeddings / vision / transcript-infer / gemini-batch-orchestrator).
 * Routing the SQL ai_run insert through here captures every path without
 * touching the call sites.
 *
 * Two sinks, both fire-and-forget, neither may throw back to the LLM call:
 *   1. Firestore `llmUsage` — legacy admin cost dashboards (retained during
 *      the dual-write window).
 *   2. PostgreSQL `ai_run` — the cost-modelling system of record going
 *      forward, via insertAiRun (worker/src/data/persistence/ai-run.ts).
 *
 * Gap fixes vs. the original implementation:
 *   - The `userId` early-return is GONE. Unattributed calls (system jobs,
 *     batch backfills, the sentinel path) are now recorded — cost is incurred
 *     regardless of attribution, and dropping the row hid the cost. When
 *     userId is absent the ai_run row's user_id is left NULL (or attributed
 *     to the sentinel inside insertAiRun); the Firestore doc keeps userId null.
 *   - cost_usd is computed here via cost-rates.ts (cached tokens priced at the
 *     cached rate) and passed into insertAiRun so the SQL row carries a
 *     per-call USD figure without a separate pricing pass.
 *   - errorCode is threaded from the provider wrapper's failure path so a
 *     failed/MAX_TOKENS call that still billed output tokens is captured.
 */

import type { LlmRequest, LlmUsage } from "../providers/types";
import { logWarn } from "../logger";
import { firestoreAdminReady, getDb, type FirestoreEnv } from "./firestore-admin";
import { checkPass7UsageAnomaly } from "./usage-anomaly";
import type { CostControlEnv } from "../cost-control-config";
import { estimateTokenCostUsd } from "../cost-rates";
import { insertAiRun } from "./persistence/ai-run";
import type { PostgresEnv } from "./persistence/postgres-pool";
import { postgresReady } from "./persistence/postgres-pool";

export interface LlmUsageRecord extends LlmUsage {
  passName: string;
  /** Optional — unattributed calls are now recorded (sentinel/null attribution). */
  userId?: string;
  callId?: string;
  /** NULL on success; set on failed/billed runs captured on the failure path. */
  errorCode?: string | null;
  createdAt: number;
}

/** Optional context threaded from route handlers into pipeline LLM calls. */
export interface UsageTracking {
  userId?: string;
  callId?: string;
}

/** Merge route/pipeline usage context into an LLM request. */
export function withUsageTracking(req: LlmRequest, ctx?: UsageTracking): LlmRequest {
  if (!ctx?.userId && !ctx?.callId) return req;
  return {
    ...req,
    userId: req.userId ?? ctx?.userId,
    callId: req.callId ?? ctx?.callId,
  };
}

type UsageEnv = FirestoreEnv & CostControlEnv & PostgresEnv;

/**
 * Persist one usage row to both sinks — never throws; never blocks the caller.
 *
 * userId is now optional: when absent the Firestore doc stores null and the
 * ai_run row's user_id is left NULL (or attributed to the sentinel inside
 * insertAiRun). cost_usd is computed via cost-rates.ts.
 */
export function recordLlmUsage(
  env: UsageEnv | undefined,
  record: Omit<LlmUsageRecord, "createdAt">,
): void {
  const userId = record.userId?.trim() || undefined;
  const costUsd = estimateTokenCostUsd(record.model, {
    promptTokens: record.promptTokens,
    outputTokens: record.outputTokens,
    cachedTokens: record.cachedTokens,
  });

  // --- Sink 1: PostgreSQL ai_run (cost-modelling system of record) ----------
  // Record even when userId is absent (cost is incurred regardless). The
  // insert runs in its own short system-context transaction and never throws
  // back to the LLM call.
  if (postgresReady(env)) {
    void insertAiRun(env, {
      callId: record.callId ?? null,
      passName: record.passName,
      userId: userId ?? null,
      model: record.model,
      promptTokens: record.promptTokens,
      outputTokens: record.outputTokens,
      cachedTokens: record.cachedTokens,
      groundingQueries: record.groundingQueries,
      latencyMs: record.latencyMs,
      cacheHit: record.cacheHit === true,
      retryCount: record.retryCount ?? 0,
      costUsd,
      errorCode: record.errorCode ?? null,
    });
  }

  // --- Sink 2: Firestore llmUsage (legacy admin dashboards) -----------------
  // Retained during the dual-write window. Still no-op when Firestore admin
  // is not configured (pure-sql mode) — ai_run above is the authoritative sink.
  if (!firestoreAdminReady(env)) return;

  void (async () => {
    try {
      const db = await getDb(env);
      await db.collection("llmUsage").add({
        callId: record.callId || null,
        userId: userId ?? null,
        passName: record.passName,
        model: record.model,
        promptTokens: record.promptTokens,
        outputTokens: record.outputTokens,
        cachedTokens: record.cachedTokens,
        groundingQueries: record.groundingQueries,
        latencyMs: record.latencyMs,
        cacheHit: record.cacheHit === true,
        retryCount: record.retryCount ?? 0,
        costUsd, // now also surfaced in the legacy doc for dashboard parity
        errorCode: record.errorCode ?? null,
        createdAt: Date.now(),
      });
      // Anomaly detection still keys off userId (it needs per-user attribution
      // for the rolling p95); skip when unattributed rather than dropping the row.
      if (userId) {
        checkPass7UsageAnomaly(env, { ...record, userId });
      }
    } catch (err) {
      logWarn("[llm-usage] firestore write failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();
}