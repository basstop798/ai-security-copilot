import { runAllChecks } from '../lib/checks';
import { validateDomainInput, assertPublicHostname } from '../lib/validate';
import { groundFindings } from '../lib/grounding';

async function main() {
  const domain = validateDomainInput(process.argv[2] || 'demo.testfire.net');
  await assertPublicHostname(domain);
  const findings = await runAllChecks(domain);
  const grounded = groundFindings(findings);
  const summary = grounded.map((g) => ({
    id: g.finding.id,
    severity: g.finding.severity,
    sourceUrl: g.sourceUrl,
  }));
  console.log(JSON.stringify({ domain, count: grounded.length, summary }, null, 2));
  const uncited = grounded.filter((g) => g.sourceUrl === 'https://cwe.mitre.org/');
  console.log(`\nUngrounded (fallback citation) count: ${uncited.length}`);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
