/**
 * AI Security Co-pilot — shared domain types.
 *
 * These types describe the full pipeline's data shapes:
 *   passive checks -> Finding[] -> grounding (cve-kb.json) -> LLM copy (impact/fix)
 *   -> CopilotReport rendered in the UI (ar / fr / en).
 *
 * Severity and category are ALWAYS decided by deterministic check code
 * (checks.ts) or by grounding against the local knowledge base
 * (grounding.ts) — never by the LLM. The LLM only ever produces
 * human-readable `impact` / `fix` text (see schema.ts).
 */

/** Which passive check produced this finding. Exactly four modules, no more. */
export type Category = 'tls' | 'headers' | 'email' | 'cookies';

/** Ordered worst -> best: critical > high > medium > low > info. */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** Supported report languages. Arabic renders right-to-left in the UI. */
export type ReportLanguage = 'ar' | 'fr' | 'en';

/**
 * One raw observation produced by a passive check, before grounding or
 * translation. `id` is a stable machine slug (e.g. "tls-cert-expired") used
 * to key grounding lookups and LLM output — it is not shown to the end user.
 */
export type Finding = {
  id: string;
  category: Category;
  severity: Severity;
  /** Short title, e.g. "TLS certificate has expired". */
  title: string;
  /** Concrete technical detail, e.g. "Certificate expired 97 days ago (2025-06-12)." */
  detail: string;
};

/** A Finding enriched with a grounded citation and LLM-written copy. */
export type GroundedFinding = Finding & {
  /** Plain-language "what could happen to you" text, in report.language. */
  impact: string;
  /** Plain-language "what to do" text, in report.language. */
  fix: string;
  /** Citation URL from the local CVE/CWE/RFC knowledge base (grounding.ts). */
  sourceUrl: string;
};

/** Fixes bucketed by urgency, built by plain code (never the LLM). */
export type ActionPlan = {
  /** Critical/high severity findings. */
  today: string[];
  /** Medium severity findings. */
  thisWeek: string[];
  /** Low/info severity findings. */
  thisMonth: string[];
};

/** The full report returned by /api/check and rendered in the UI. */
export type CopilotReport = {
  domain: string;
  /** 0 (safe) - 100 (severe), computed by plain code from finding severities. */
  riskScore: number;
  language: ReportLanguage;
  findings: GroundedFinding[];
  actionPlan: ActionPlan;
};
