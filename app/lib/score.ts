/**
 * Plain-code scoring + action-plan bucketing. Never touched by the LLM —
 * see CLAUDE.md pipeline step 6.
 */

import type { ActionPlan, GroundedFinding, Severity } from './types';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 40,
  high: 25,
  medium: 12,
  low: 5,
  info: 1,
};

/** 0 (safe) - 100 (severe). Sum of severity weights, capped at 100. */
export function computeRiskScore(severities: Severity[]): number {
  const total = severities.reduce((sum, s) => sum + SEVERITY_WEIGHT[s], 0);
  return Math.min(100, total);
}

/** Bucket findings by urgency: critical/high -> today, medium -> this week, low/info -> this month. */
export function buildActionPlan(findings: Pick<GroundedFinding, 'severity' | 'title' | 'fix'>[]): ActionPlan {
  const plan: ActionPlan = { today: [], thisWeek: [], thisMonth: [] };
  for (const f of findings) {
    const line = f.fix?.trim() ? f.fix : f.title;
    if (f.severity === 'critical' || f.severity === 'high') plan.today.push(line);
    else if (f.severity === 'medium') plan.thisWeek.push(line);
    else plan.thisMonth.push(line);
  }
  return plan;
}
