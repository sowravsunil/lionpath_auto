# Data Protection Impact Assessment — LLM Transcript Processing

## Data flow

Call transcripts (Zoom/Kaia recordings transcribed to text) are sent to an
external LLM provider (Google Gemini API or Anthropic API) for analysis.
The transcript contains PII: customer names, employee names, deal terms,
pricing, objections, verbal commitments, and competitive intelligence.

```
Call recording → transcription → transcript text
  → worker/src/postcall/*.ts → provider.generate({ user: transcript })
  → Google Gemini API (generativelanguage.googleapis.com) or Anthropic API
  → JSON analysis response → stored in post_call.analysis / post_call.detail
```

## Risk

The transcript is sent as plaintext to the LLM provider's API. The
provider may log, cache, or (depending on the API plan) use the data for
model training. For customers with data residency requirements (GDPR,
SOC 2), this constitutes a data transfer to a third-party processor.

## Mitigations

### 1. Transcript redaction (configurable)

Set `LLM_TRANSCRIPT_REDACTION=1` to enable server-side redaction of
common PII patterns before the transcript is sent to the LLM. When
enabled, the worker redacts:
- Email addresses → `[EMAIL]`
- Phone numbers → `[PHONE]`
- Credit card numbers → `[CC]`

This is a best-effort regex-based redaction — it does not redact names or
company names (those are context-dependent and require NER, which itself
needs an LLM call). Full NER-based redaction is a future enhancement.

### 2. Vertex AI (recommended for production)

Use `LLM_PROVIDER=gemini` with `GOOGLE_CLOUD_PROJECT` set (Vertex AI mode)
instead of `GEMINI_API_KEY` (AI Studio mode). Vertex AI processes data
within your GCP project boundary under your organization's data
governance policies. AI Studio may use data for model improvement
depending on the API plan.

### 3. Data minimization

The worker already truncates transcripts before sending (`trimTranscript`
in `commit.ts:356` — tail 6000 chars). The `maxTokens` parameter on each
LLM call caps the response size. The `thinkingBudget` parameter limits
reasoning tokens.

## Residual risk

Even with redaction enabled, the transcript contains contextual
information (deal names, product features, competitive positioning) that
could identify the customer. Full redaction would require NER, which
itself sends data to an LLM. The recommended approach for
compliance-sensitive deployments is Vertex AI with a DPA in place.

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `LLM_TRANSCRIPT_REDACTION` | `""` (off) | When `1`/`true`, redact emails/phones/CCs before sending to LLM |