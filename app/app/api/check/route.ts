import { NextResponse } from 'next/server';
import { validateDomainInput, assertPublicHostname } from '@/lib/validate';
import { runAllChecks } from '@/lib/checks';
import { groundFindings } from '@/lib/grounding';
import { writeReport } from '@/lib/ai';
import { computeRiskScore, buildActionPlan } from '@/lib/score';
import { checkRateLimit } from '@/lib/rate-limit';
import { localizedTitle } from '@/lib/finding-text';
import { DEMO_DOMAIN, DEMO_GROUNDED_FINDINGS } from '@/lib/demo-data';
import type { CopilotReport, GroundedFinding, ReportLanguage } from '@/lib/types';

export const runtime = 'nodejs'; // dns/tls need the Node runtime, not Edge.

const SUPPORTED_LANGUAGES: ReportLanguage[] = ['ar', 'fr', 'en'];

function clientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: Request) {
  const rate = checkRateLimit(clientId(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many checks — please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { domain: rawDomain, consent, language: rawLanguage } = (body ?? {}) as {
    domain?: string;
    consent?: boolean;
    language?: string;
  };

  if (consent !== true) {
    return NextResponse.json(
      { error: 'You must confirm you own this website or have permission to check it.' },
      { status: 400 },
    );
  }

  const language: ReportLanguage = SUPPORTED_LANGUAGES.includes(rawLanguage as ReportLanguage)
    ? (rawLanguage as ReportLanguage)
    : 'en';

  let domain: string;
  try {
    domain = validateDomainInput(rawDomain ?? '');
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  let grounded: { finding: import('@/lib/types').Finding; sourceUrl: string }[];
  let usedDemoFallback = false;

  try {
    await assertPublicHostname(domain);
    const findings = await runAllChecks(domain);
    if (findings.length === 0) {
      return NextResponse.json(
        { error: 'No findings — the site looked fully clean on all four checks, or was unreachable.' },
        { status: 200 },
      );
    }
    grounded = groundFindings(findings).map((g) => ({ finding: g.finding, sourceUrl: g.sourceUrl }));
  } catch (err) {
    // Live check failed (SSRF guard, DNS, timeout...). If this is our known
    // demo target, serve the pre-captured real result instead of erroring —
    // this is what keeps the live demo from breaking. Otherwise, surface
    // the actual error (e.g. "private address" must stay a hard failure).
    if (domain === DEMO_DOMAIN) {
      grounded = DEMO_GROUNDED_FINDINGS;
      usedDemoFallback = true;
    } else {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  const { report: llmReport, provider } = await writeReport(
    grounded.map((g) => g.finding),
    language,
  );

  const textById = new Map(llmReport.findings.map((f) => [f.id, f]));
  const sourceById = new Map(grounded.map((g) => [g.finding.id, g.sourceUrl]));

  // The checks write their titles in English (they double as machine labels),
  // so swap in the localized title for display. Severity, id and category are
  // untouched.
  const findings: GroundedFinding[] = grounded.map((g) => ({
    ...g.finding,
    title: localizedTitle(g.finding.id, language, g.finding.title),
    impact: textById.get(g.finding.id)?.impact || '',
    fix: textById.get(g.finding.id)?.fix || '',
    sourceUrl: sourceById.get(g.finding.id) || g.sourceUrl,
  }));

  const report: CopilotReport = {
    domain,
    riskScore: computeRiskScore(findings.map((f) => f.severity)),
    language,
    findings,
    actionPlan: buildActionPlan(findings),
  };

  return NextResponse.json({
    report,
    meta: { aiProvider: provider, usedDemoFallback },
  });
}
