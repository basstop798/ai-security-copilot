/**
 * Deterministic grounding: attach a real citation (from cve-kb.json) to each
 * raw Finding.
 *
 * The mapping is EXPLICIT: every finding kind our checks can produce names
 * exactly one knowledge-base entry (see FINDING_KIND_TO_KB below). There is
 * no keyword or substring matching, because that cannot be made safe —
 * a finding's `detail` text contains live values (certificate day counts,
 * cookie names, SPF records) which would collide with KB keywords and cite
 * an unrelated vulnerability. A real example from the previous version:
 * "Certificate expires in 21 day(s)" matched a KB entry keyed on port "21"
 * and was reported as the vsftpd 2.3.4 backdoor at CRITICAL severity.
 *
 * Severity is NOT decided here. It belongs to the check that made the
 * observation (checks.ts), because only the check knows the actual
 * condition — "expires in 21 days" (medium) and "expired 97 days ago"
 * (critical) are the same class of issue with very different urgency.
 * Grounding adds a citation and nothing else, so it can never inflate a
 * score. `citedSeverity` reports the knowledge base's own generic severity
 * for that class of issue, for transparency only.
 */

import type { Finding, Severity } from './types';
// Statically imported (not readFileSync'd from a repo-root path) so it gets
// bundled into the serverless function and works on Vercel, where only app/
// is deployed — an earlier version read this file from a repo-root-relative
// path, which worked locally from a full checkout but threw ENOENT in
// production. This file is the single source of truth for citations; there is
// deliberately no second copy to drift out of sync with it.
import kbData from './cve-kb.json';

type KbEntry = {
  id: string;
  title: string;
  /** The knowledge base's generic severity for this class of issue. */
  severity: Severity;
  summary: string;
  remediation: string[];
  reference: string;
};

const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/**
 * The worse of two severities. No longer used by groundFinding (grounding
 * never changes a severity) but kept as a tested helper for comparing
 * severities elsewhere.
 */
export function worstOf(a: Severity, b: Severity): Severity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

/**
 * Every finding kind checks.ts can produce -> the one knowledge-base entry
 * that documents exactly that condition.
 *
 * Cookie findings carry the live cookie name in their id
 * (`cookie-JSESSIONID-no-secure`), so they are keyed by their stable suffix
 * instead; see findingKind().
 *
 * `headers-unreachable` is deliberately absent: "the homepage did not
 * respond" is a failed measurement, not a security weakness, so there is
 * nothing honest to cite for it.
 */
const FINDING_KIND_TO_KB: Record<string, string> = {
  // --- TLS / transport ---
  'tls-no-https': 'CWE-319-NO-HTTPS',
  'tls-cert-expired': 'CWE-295-CERT-EXPIRED',
  'tls-cert-expiring-soon': 'CERT-EXPIRING-SOON',
  'tls-http-not-redirected': 'CWE-319-NO-HTTPS',
  'headers-served-over-http': 'CWE-319-NO-HTTPS',

  // --- Security headers ---
  'header-missing-hsts': 'CWE-693-HEADERS',
  'header-missing-csp': 'CWE-693-HEADERS',
  'header-missing-x-frame-options': 'CWE-693-HEADERS',
  'header-missing-x-content-type-options': 'CWE-693-HEADERS',
  'header-missing-referrer-policy': 'CWE-693-HEADERS',

  // --- Email authentication ---
  'email-no-spf': 'SPF-MISSING',
  'email-spf-permissive': 'SPF-PERMISSIVE',
  'email-no-dmarc': 'DMARC-MISSING',
  'email-dmarc-p-none': 'DMARC-NONE',

  // --- Cookie flags (keyed by suffix, see findingKind) ---
  'cookie-no-httponly': 'CWE-1004-COOKIE-HTTPONLY',
  'cookie-no-secure': 'CWE-614-COOKIE-SECURE',
  'cookie-no-samesite': 'CWE-352-SAMESITE',
};

/** Finding kinds that intentionally have no citation. */
const UNCITED_FINDING_KINDS = new Set(['headers-unreachable']);

/**
 * Reduce a finding id to its stable kind. Cookie ids embed the live cookie
 * name (`cookie-<name>-no-secure`), which must not take part in the lookup.
 */
export function findingKind(findingId: string): string {
  if (findingId.startsWith('cookie-')) {
    for (const flag of ['no-httponly', 'no-secure', 'no-samesite']) {
      if (findingId.endsWith(`-${flag}`)) return `cookie-${flag}`;
    }
  }
  return findingId;
}

let cachedKb: Map<string, KbEntry> | null = null;

function kbById(): Map<string, KbEntry> {
  if (!cachedKb) {
    cachedKb = new Map((kbData as KbEntry[]).map((entry) => [entry.id, entry]));
  }
  return cachedKb;
}

export type GroundedResult = {
  finding: Finding;
  sourceUrl: string;
  citedSeverity: Severity;
};

/** Used when a finding kind has no (or an unresolvable) citation. */
const FALLBACK_SOURCE_URL = 'https://cwe.mitre.org/';

/** The knowledge-base entry that documents this finding, or null. */
export function findKbEntry(finding: Finding): KbEntry | null {
  const kbId = FINDING_KIND_TO_KB[findingKind(finding.id)];
  if (!kbId) return null;
  const entry = kbById().get(kbId);
  if (!entry) {
    // A mapping points at an id that is not in the KB file — a packaging
    // bug, not a user-facing condition. Fail loudly in the log, degrade to
    // the generic citation rather than breaking the report.
    console.error(`[grounding] mapped KB entry "${kbId}" is missing from cve-kb.json`);
    return null;
  }
  return entry;
}

/**
 * Ground one finding: attach the citation for its kind. The finding itself
 * — severity included — is returned unchanged.
 */
export function groundFinding(finding: Finding): GroundedResult {
  const entry = findKbEntry(finding);
  if (!entry) {
    if (!UNCITED_FINDING_KINDS.has(findingKind(finding.id))) {
      // An unmapped finding kind means checks.ts grew a new finding and
      // nobody added its citation. Surfaced in the log so it is caught in
      // development instead of silently shipping an uncited finding.
      console.error(`[grounding] no KB mapping for finding kind "${findingKind(finding.id)}"`);
    }
    return { finding, sourceUrl: FALLBACK_SOURCE_URL, citedSeverity: finding.severity };
  }
  return { finding, sourceUrl: entry.reference, citedSeverity: entry.severity };
}

export function groundFindings(findings: Finding[]): GroundedResult[] {
  return findings.map(groundFinding);
}

/** Exported for tests: the full finding-kind -> KB-entry mapping. */
export const GROUNDING_MAP: Readonly<Record<string, string>> = FINDING_KIND_TO_KB;
