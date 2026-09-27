import { z } from 'zod';

/**
 * Validates the LLM's JSON output for the "write plain-language copy" step
 * (CLAUDE.md pipeline step 3). The model receives Finding[] (id, category,
 * severity, title, detail) plus the target language and MUST return only
 * `impact` and `fix` text keyed by `id` — it never invents or changes a
 * `severity` or `category`.
 *
 * `.strict()` on every object below means any extra key (e.g. a
 * hallucinated "severity" or "category" field) fails validation instead of
 * silently passing through. That failure is what should trigger the
 * one-shot repair retry (pipeline step 4) — feed `error` from
 * `parseLlmOutput` straight back into the repair prompt.
 */

export const REPORT_LANGUAGES = ['ar', 'fr', 'en'] as const;

/** One item of LLM-authored copy for a single finding id. */
export const LlmFindingTextSchema = z
  .object({
    id: z.string().min(1, 'id is required'),
    impact: z.string().min(1, 'impact is required').max(1200, 'impact is too long'),
    fix: z.string().min(1, 'fix is required').max(1200, 'fix is too long'),
  })
  .strict();

export type LlmFindingText = z.infer<typeof LlmFindingTextSchema>;

/** The full expected LLM response envelope. */
export const LlmReportSchema = z
  .object({
    language: z.enum(REPORT_LANGUAGES),
    findings: z.array(LlmFindingTextSchema).min(1, 'at least one finding is required'),
  })
  .strict();

export type LlmReport = z.infer<typeof LlmReportSchema>;

export type LlmValidationResult =
  | { success: true; data: LlmReport }
  | { success: false; error: string };

/**
 * Parse + validate raw LLM output (a JSON string, or an already-parsed
 * value if the provider SDK gives you one). Returns a discriminated union
 * instead of throwing so callers can feed `error` straight back into the
 * one-shot repair prompt without a try/catch at every call site.
 */
export function parseLlmOutput(raw: unknown): LlmValidationResult {
  let candidate: unknown = raw;

  if (typeof raw === 'string') {
    try {
      candidate = JSON.parse(raw);
    } catch (err) {
      return {
        success: false,
        error: `Response was not valid JSON: ${(err as Error).message}`,
      };
    }
  }

  const result = LlmReportSchema.safeParse(candidate);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    return { success: false, error: message };
  }
  return { success: true, data: result.data };
}

/**
 * Extra safety on top of the shape check: reject an LLM response whose
 * finding ids are not a subset of the ids we actually sent it. This stops
 * the model from inventing findings that were never observed by the passive
 * checks. Call this after `parseLlmOutput` succeeds.
 */
export function assertKnownFindingIds(llmReport: LlmReport, knownIds: readonly string[]): void {
  const known = new Set(knownIds);
  const unknown = llmReport.findings.filter((f) => !known.has(f.id)).map((f) => f.id);
  if (unknown.length > 0) {
    throw new Error(`LLM response referenced unknown finding id(s): ${unknown.join(', ')}`);
  }
}
