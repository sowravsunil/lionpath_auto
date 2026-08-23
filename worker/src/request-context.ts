/**
 * Per-request correlation ID — threaded through post-call handlers and logs.
 * Also carries assume-identity claims so response headers can be stamped
 * on every API response without re-verifying the token.
 */

import type { AssumeIdentityClaims } from "./auth";

let activeCorrelationId: string | undefined;
let activeAssumeIdentity: AssumeIdentityClaims | undefined;

export function correlationIdFromRequest(request: Request): string {
  const header =
    request.headers.get("X-Request-Id")?.trim() ||
    request.headers.get("X-Correlation-Id")?.trim();
  return header || crypto.randomUUID();
}

export function getCorrelationId(): string | undefined {
  return activeCorrelationId;
}

/** Set by requireUser when the verified token carries assume-identity claims. */
export function setAssumeIdentityForRequest(claims: AssumeIdentityClaims | undefined): void {
  activeAssumeIdentity = claims;
}

/** Read by withCorrelationHeader to stamp X-Assume-Identity on every response. */
export function getAssumeIdentityForRequest(): AssumeIdentityClaims | undefined {
  return activeAssumeIdentity;
}

export async function runWithRequestContext<T>(
  correlationId: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const prevCorrelation = activeCorrelationId;
  const prevAssume = activeAssumeIdentity;
  activeCorrelationId = correlationId;
  activeAssumeIdentity = undefined;
  try {
    return await fn();
  } finally {
    activeCorrelationId = prevCorrelation;
    activeAssumeIdentity = prevAssume;
  }
}
