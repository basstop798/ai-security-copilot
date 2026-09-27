/**
 * Deterministic grounding: attach a real citation (from cve-kb.json)
 * to each raw Finding by keyword matching. The LLM never invents CVEs or
 * decides severity — grounding can only ever RAISE severity, never lower it
 * (worstOf), because the underlying check already observed the problem.
 */

import type { Finding, Severity } from './types';
// Statically imported (not readFileSync'd from a repo-root path) so it gets
// bundled into the serverless function and works on Vercel, where only
// app/ is deployed — a relative-path readFileSync into ../prep would 404
// with ENOENT in production even though it works when run locally from a
// full git checkout. This file is a build-time copy of prep/cve-kb.json;
// see CLAUDE.md "Keep in sync" note if the source KB changes.
import kbData from './cve-kb.json';

type KbEntry = {
  id: string;
  title: string;
  service: string;
  affected: string;
  keywords: string[];
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

/** Never downgrade: the higher-ranked severity always wins. */
export function worstOf(a: Severity, b: Severity): Severity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

let cachedKb: KbEntry[] | null = null;

function loadKb(): KbEntry[] {
  if (cachedKb) return cachedKb;
  cachedKb = kbData as KbEntry[];
  return cachedKb;
}

export type GroundingMatch = {
  entry: KbEntry;
  score: number;
};

/** Score = number of KB keywords found (case-insensitive) in title+detail. */
function scoreEntry(finding: Finding, entry: KbEntry): number {
  const haystack = `${finding.title} ${finding.detail}`.toLowerCase();
  let score = 0;
  for (const kw of entry.keywords) {
    if (haystack.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

/** Best-matching KB entry for a finding, or null if nothing scores > 0. */
export function findBestMatch(finding: Finding): GroundingMatch | null {
  const kb = loadKb();
  let best: GroundingMatch | null = null;
  for (const entry of kb) {
    const score = scoreEntry(finding, entry);
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best;
}

export type GroundedResult = {
  finding: Finding;
  sourceUrl: string;
  citedSeverity: Severity;
};

const FALLBACK_SOURCE_URL = 'https://cwe.mitre.org/';

/**
 * Ground one finding: look up the best KB match, take the worse of the two
 * severities, and return a citation URL. If nothing matches, keep the
 * check's own severity and fall back to a generic reference (never leave
 * a finding uncited).
 */
export function groundFinding(finding: Finding): GroundedResult {
  const match = findBestMatch(finding);
  if (!match) {
    return {
      finding,
      sourceUrl: FALLBACK_SOURCE_URL,
      citedSeverity: finding.severity,
    };
  }
  return {
    finding: { ...finding, severity: worstOf(finding.severity, match.entry.severity) },
    sourceUrl: match.entry.reference,
    citedSeverity: match.entry.severity,
  };
}

export function groundFindings(findings: Finding[]): GroundedResult[] {
  return findings.map(groundFinding);
}
