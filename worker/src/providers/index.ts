// Provider factory. To add a provider: create ./<name>.ts exporting a function that returns an
// LlmProvider, then add a case here and set LLM_PROVIDER=<name> in wrangler.toml. Nothing else
// in the app needs to change.
//
// Web research is provider-specific:
//   - anthropic → server-side web_search / web_fetch tools (implemented)
//   - gemini    → map to the google_search grounding tool
//   - ollama    → no built-in web search; wire a separate search step or call with research:false

import type { CostControlEnv } from "../cost-control-config";
import type { FirestoreEnv } from "../data/firestore-admin";
import { recordLlmUsage } from "../data/llm-usage";
import { reserveDailyTokenBudget, totalTokens } from "../data/token-budget";
import { logInfo } from "../logger";
import type { LlmProvider, LlmRequest, LlmResult, LlmUsage, ProviderEnv } from "./types";
import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import {
  type PrepPassName,
  resolveDefaultModel,
  resolvePassModel,
  resolvePostCallModel,
  resolveResearchModel,
  resolveSynthesizeModel,
} from "./pass-models";

type ProviderFsEnv = FirestoreEnv & CostControlEnv;

/**
 * Classify a provider error into an error_code_enum value for ai_run.
 * Mirrors the enum in 00_phase0_infra_and_org.sql. Used on the failure path
 * so a failed/MAX_TOKENS call that still billed output tokens is captured
 * with its error class for cost dashboards.
 */
function classifyLlmError(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  // Gemini/Anthropic rate limits surface as 429 in the error message after
  // gemini-retry exhausts its budget.
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("rate_limit") || msg.includes("resource_exhausted")) {
    return "rate_limit";
  }
  // Auth/key issues.
  if (msg.includes("401") || msg.includes("403") || msg.includes("permission") || msg.includes("api key") || msg.includes("unauthorized")) {
    return "auth_failure";
  }
  // Parse / safety / no-candidates / MAX_TOKENS — the model returned a response
  // we could not use (output tokens may still have been billed).
  if (msg.includes("max_tokens") || msg.includes("maxtokens") || msg.includes("finishreason") || msg.includes("no candidates") || msg.includes("no text") || msg.includes("safety") || msg.includes("recitation") || msg.includes("blocked") || msg.includes("could not parse json") || msg.includes("expected ")) {
    return "validation_error";
  }
  // 5xx / network / provider-side.
  if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("504") || msg.includes("timeout") || msg.includes("network") || msg.includes("econnreset") || msg.includes("fetch failed") || msg.includes("gemini api")) {
    return "remote_error";
  }
  return "remote_error";
}

function wrapWithUsageRecording(provider: LlmProvider, fsEnv?: ProviderFsEnv): LlmProvider {
  return {
    async generate(req: LlmRequest): Promise<LlmResult> {
      const settleBudget = await reserveDailyTokenBudget(fsEnv, req.userId);
      // usage/partial-usage captured on BOTH success and failure paths so a
      // failed call that still billed tokens (MAX_TOKENS, safety block after
      // generation, retried-then-failed 429) is recorded in ai_run.
      let captured: { usage?: LlmUsage; errorCode?: string } = {};
      try {
        const result = await provider.generate(req);
        captured = { usage: result.usage };
        const u = result.usage;
        const used = u ? totalTokens(u.promptTokens, u.outputTokens) : 0;
        await settleBudget(used);
        // recordLlmUsage now records even when req.userId is absent (sentinel/
        // null attribution) — cost is incurred regardless of attribution. When
        // the provider returned no usage (e.g. a degenerate response), record a
        // zero-token success row rather than skipping, so the call is still
        // counted in ai_run.
        recordLlmUsage(fsEnv, {
          userId: req.userId,
          callId: req.callId,
          passName: req.passName,
          cacheHit: req.cacheHit,
          model: u?.model ?? resolveDefaultModel(fsEnv as ProviderEnv),
          promptTokens: u?.promptTokens ?? 0,
          outputTokens: u?.outputTokens ?? 0,
          cachedTokens: u?.cachedTokens ?? 0,
          groundingQueries: u?.groundingQueries ?? 0,
          latencyMs: u?.latencyMs ?? 0,
          retryCount: u?.retryCount ?? 0,
        });
        return result;
      } catch (err) {
        await settleBudget(0);
        // No result.usage on a thrown error (the provider throws before
        // returning), so we record a zero-token failed run tagged with the
        // error class. model falls back to the env default — the provider
        // resolves the real model internally and does not surface it on error,
        // so this is an approximation for the cost row; the error code is the
        // reliable signal. If a provider ever attaches a partial usage to the
        // error object (e.g. via a subclass), prefer it.
        const partialUsage = (err as { usage?: LlmUsage }).usage;
        captured = { usage: partialUsage, errorCode: classifyLlmError(err) };
        recordLlmUsage(fsEnv, {
          userId: req.userId,
          callId: req.callId,
          passName: req.passName,
          cacheHit: req.cacheHit,
          model: partialUsage?.model ?? resolveDefaultModel(fsEnv as ProviderEnv),
          promptTokens: partialUsage?.promptTokens ?? 0,
          outputTokens: partialUsage?.outputTokens ?? 0,
          cachedTokens: partialUsage?.cachedTokens ?? 0,
          groundingQueries: partialUsage?.groundingQueries ?? 0,
          latencyMs: partialUsage?.latencyMs ?? 0,
          retryCount: partialUsage?.retryCount ?? 0,
          errorCode: captured.errorCode,
        });
        throw err;
      }
    },
  };
}

export {
  DEFAULT_MODEL,
  PREMIUM_MODEL,
  PREP_PASS_MODELS,
  resolveDefaultModel,
  resolvePassModel,
  resolvePostCallModel,
  resolveResearchModel,
  resolveSynthesizeModel,
} from "./pass-models";
export type { PassModelConfig, PassTier, PrepPassName } from "./pass-models";

/** Log resolved models once at worker startup (Cloud Run / VPS logs). */
export function logResolvedModels(env: ProviderEnv): void {
  const visionModel = resolvePostCallModel(env);
  logInfo("[llm] resolved models", {
    MODEL: resolveDefaultModel(env),
    RESEARCH_MODEL: resolveResearchModel(env),
    SYNTHESIZE_MODEL: resolveSynthesizeModel(env),
    POSTCALL_MODEL: resolvePostCallModel(env),
    VISION_MODEL: visionModel,
  });
}

export function getProvider(env: ProviderEnv & FirestoreEnv): LlmProvider {
  const provider = (env.LLM_PROVIDER || "gemini").toLowerCase();
  return wrapWithUsageRecording(resolveProvider(provider, env), env);
}

/** Pre-call pass-specific provider — reads model from PREP_PASS_MODELS table. */
export function getProviderForPass(
  passName: PrepPassName,
  env: ProviderEnv & FirestoreEnv,
): LlmProvider {
  const provider = (env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "gemini") {
    return wrapWithUsageRecording(geminiProvider(env, resolvePassModel(passName, env)), env);
  }
  return wrapWithUsageRecording(resolveProvider(provider, env), env);
}

/** Pre-call brief synthesis — may use a heavier Gemini model than extract/repair. */
export function getSynthesizeProvider(env: ProviderEnv & FirestoreEnv): LlmProvider {
  return getProviderForPass("synthesize", env);
}

/** Pre-call web research — may use a heavier Gemini model than synthesize/post-call. */
export function getResearchProvider(env: ProviderEnv & FirestoreEnv): LlmProvider {
  return getProviderForPass("research", env);
}

/** Stable seed from pass + prompt so identical inputs get identical Gemini sampling. */
function postcallSeedFromPrompt(passName: string, user: string): number {
  const basis = `${passName}\0${user}`;
  let h = 2166136261;
  for (let i = 0; i < basis.length; i++) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Gemini generationConfig.seed must be signed INT32.
  const unsigned = h >>> 0;
  return (unsigned % 2_147_483_647) || 1;
}

/** Post-call uses its own provider/model so it can differ from pre-call (e.g. faster model, no web search). */
export function getPostCallProvider(env: ProviderEnv & FirestoreEnv): LlmProvider {
  const provider = (env.POSTCALL_LLM_PROVIDER || env.LLM_PROVIDER || "gemini").toLowerCase();
  const model = resolvePostCallModel(env);
  const inner =
    provider === "gemini"
      ? wrapWithUsageRecording(geminiProvider(env, model), env)
      : wrapWithUsageRecording(resolveProvider(provider, env), env);
  return {
    async generate(req: LlmRequest): Promise<LlmResult> {
      const retryAttempt = req.retryAttempt ?? 0;
      const baseSeed = req.seed ?? postcallSeedFromPrompt(req.passName, req.user);
      const seed = retryAttempt > 0 ? baseSeed + retryAttempt * 7919 : baseSeed;
      const temperature = retryAttempt > 0 ? Math.max(0.15, req.temperature ?? 0) : req.temperature ?? 0;
      const result = await inner.generate({
        ...req,
        retryAttempt,
        temperature,
        seed,
      });
      if (retryAttempt > 0) {
        logInfo("[postcall-llm] retry complete", {
          passName: req.passName,
          retryAttempt,
          seed,
          temperature,
          finishReason: result.finishReason ?? "unknown",
          outputTokens: result.usage?.outputTokens ?? 0,
        });
      }
      return result;
    },
  };
}

function resolveProvider(provider: string, env: ProviderEnv): LlmProvider {
  switch (provider) {
    case "anthropic":
      return anthropicProvider(env);
    case "gemini":
      return geminiProvider(env);
    case "ollama":
      throw new Error(
        "Ollama provider not implemented yet. Add worker/src/providers/ollama.ts implementing " +
          "LlmProvider. Ollama has no built-in web search — wire a separate search step or run with research:false.",
      );
    default:
      throw new Error(`Unknown LLM_PROVIDER "${env.LLM_PROVIDER}".`);
  }
}
