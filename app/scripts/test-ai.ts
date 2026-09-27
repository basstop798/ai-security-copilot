import { groundFindings } from '../lib/grounding';
import { writeReport } from '../lib/ai';
import { computeRiskScore, buildActionPlan } from '../lib/score';
import { DEMO_GROUNDED_FINDINGS, DEMO_DOMAIN } from '../lib/demo-data';
import type { ReportLanguage, GroundedFinding } from '../lib/types';

async function main() {
  const language = (process.argv[2] as ReportLanguage) || 'ar';
  const findings = DEMO_GROUNDED_FINDINGS.map((g) => g.finding);
  const sourceById = new Map(DEMO_GROUNDED_FINDINGS.map((g) => [g.finding.id, g.sourceUrl]));

  const { report, provider } = await writeReport(findings, language);
  console.log('PROVIDER USED:', provider);

  const byId = new Map(report.findings.map((f) => [f.id, f]));
  const grounded: GroundedFinding[] = findings.map((f) => ({
    ...f,
    impact: byId.get(f.id)?.impact || '(missing)',
    fix: byId.get(f.id)?.fix || '(missing)',
    sourceUrl: sourceById.get(f.id) || '',
  }));

  const riskScore = computeRiskScore(grounded.map((g) => g.severity));
  const actionPlan = buildActionPlan(grounded);

  console.log(JSON.stringify({ domain: DEMO_DOMAIN, riskScore, language, actionPlan, sample: grounded.slice(0, 2) }, null, 2));
}

main().catch((e) => { console.error('ERROR', e); process.exit(1); });
