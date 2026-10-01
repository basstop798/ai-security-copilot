import { describe, it, expect } from 'vitest';
import {
  worstOf,
  groundFinding,
  groundFindings,
  findingKind,
  GROUNDING_MAP,
} from './grounding';
import kb from './cve-kb.json';
import type { Finding, Severity } from './types';

const ALL_SEVERITIES: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];
const GENERIC_FALLBACK = 'https://cwe.mitre.org/';

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: 'tls-cert-expired',
    category: 'tls',
    severity: 'critical',
    title: 'TLS certificate has expired',
    detail: 'Certificate expired 10 day(s) ago.',
    ...overrides,
  };
}

describe('worstOf', () => {
  it('ranks critical above everything', () => {
    for (const other of ALL_SEVERITIES) {
      expect(worstOf('critical', other)).toBe('critical');
      expect(worstOf(other, 'critical')).toBe('critical');
    }
  });

  it('orders high > medium > low > info', () => {
    expect(worstOf('high', 'medium')).toBe('high');
    expect(worstOf('medium', 'low')).toBe('medium');
    expect(worstOf('low', 'info')).toBe('low');
  });

  it('is order-independent (commutative) for every pair', () => {
    for (const a of ALL_SEVERITIES) {
      for (const b of ALL_SEVERITIES) {
        expect(worstOf(a, b)).toBe(worstOf(b, a));
      }
    }
  });

  it('returns the same severity when both arguments are equal', () => {
    for (const s of ALL_SEVERITIES) {
      expect(worstOf(s, s)).toBe(s);
    }
  });
});

// ---------------------------------------------------------------------------
// Regression: the keyword-matching bug this module was rewritten to kill.
//
// The old grounding scored KB entries by counting keyword substrings in the
// finding's title + DYNAMIC detail text. KB entries carried port numbers as
// keywords ("21" for the vsftpd backdoor, "23" for Telnet, "25" for Exim),
// so a certificate finding whose detail read "expires in 21 day(s)" was
// cited as the vsftpd 2.3.4 backdoor and escalated medium -> CRITICAL.
// ---------------------------------------------------------------------------
describe('certificate-expiry findings are never mis-cited (regression)', () => {
  it('keeps severity medium and cites the certificate-validity source for every day count 0-60', () => {
    for (let days = 0; days <= 60; days++) {
      const finding = makeFinding({
        id: 'tls-cert-expiring-soon',
        severity: 'medium',
        title: 'TLS certificate expires soon',
        detail: `Certificate (issued by R11) expires in ${days} day(s).`,
      });
      const result = groundFinding(finding);

      expect(result.finding.severity, `day count ${days} changed severity`).toBe('medium');
      expect(result.sourceUrl, `day count ${days} got the wrong citation`).toBe(
        'https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.5',
      );
    }
  });

  it('is unaffected by the certificate issuer name appearing in the detail text', () => {
    // An issuer whose name contains words that used to be KB keywords.
    const finding = makeFinding({
      id: 'tls-cert-expiring-soon',
      severity: 'medium',
      title: 'TLS certificate expires soon',
      detail: 'Certificate (issued by Apache Telnet Samba CA) expires in 21 day(s).',
    });
    const result = groundFinding(finding);
    expect(result.finding.severity).toBe('medium');
    expect(result.sourceUrl).toContain('rfc5280');
  });

  it('still reports an actually-expired certificate as critical', () => {
    const result = groundFinding(
      makeFinding({
        id: 'tls-cert-expired',
        severity: 'critical',
        detail: 'Certificate expired 97 day(s) ago.',
      }),
    );
    expect(result.finding.severity).toBe('critical');
    expect(result.sourceUrl).toBe('https://cwe.mitre.org/data/definitions/295.html');
  });
});

// ---------------------------------------------------------------------------
// Grounding attaches citations only. It must never change a severity.
// ---------------------------------------------------------------------------
describe('grounding never changes a finding', () => {
  it('returns every finding kind with its severity untouched, whatever that severity is', () => {
    for (const kind of Object.keys(GROUNDING_MAP)) {
      for (const severity of ALL_SEVERITIES) {
        const id = kind.startsWith('cookie-') ? kind.replace('cookie-', 'cookie-session-') : kind;
        const result = groundFinding(makeFinding({ id, severity, title: kind, detail: kind }));
        expect(result.finding.severity, `${kind} @ ${severity}`).toBe(severity);
      }
    }
  });

  it('does not alter any other field of the finding', () => {
    const finding = makeFinding();
    const result = groundFinding(finding);
    expect(result.finding).toEqual(finding);
  });

  it('grounds a whole list without reordering or dropping findings', () => {
    const findings = [
      makeFinding({ id: 'tls-cert-expired' }),
      makeFinding({ id: 'email-no-spf', category: 'email', severity: 'medium' }),
      makeFinding({ id: 'cookie-JSESSIONID-no-secure', category: 'cookies', severity: 'medium' }),
    ];
    const results = groundFindings(findings);
    expect(results.map((r) => r.finding.id)).toEqual(findings.map((f) => f.id));
  });
});

// ---------------------------------------------------------------------------
// Cookie findings embed a live cookie name in their id.
// ---------------------------------------------------------------------------
describe('cookie findings are keyed by flag, not by cookie name', () => {
  const cases: [string, string][] = [
    ['no-httponly', 'https://cwe.mitre.org/data/definitions/1004.html'],
    ['no-secure', 'https://cwe.mitre.org/data/definitions/614.html'],
    ['no-samesite', 'https://cwe.mitre.org/data/definitions/352.html'],
  ];

  // Cookie names seen in the wild, plus hostile ones: digits that used to
  // collide with port-number keywords, and flag words inside the name.
  const cookieNames = ['JSESSIONID', 'sid', 'PHPSESSID', '_ga', 'port21', 'secure_token', 'a-b-c'];

  for (const [flag, expectedUrl] of cases) {
    it(`cites the right source for "${flag}" regardless of the cookie name`, () => {
      for (const name of cookieNames) {
        const result = groundFinding(
          makeFinding({
            id: `cookie-${name}-${flag}`,
            category: 'cookies',
            severity: 'medium',
            title: `Cookie "${name}" missing flag`,
            detail: `Set-Cookie for "${name}" does not include the flag.`,
          }),
        );
        expect(result.sourceUrl, `${name} / ${flag}`).toBe(expectedUrl);
      }
    });
  }

  it('reduces a cookie id to its flag kind', () => {
    expect(findingKind('cookie-JSESSIONID-no-secure')).toBe('cookie-no-secure');
    expect(findingKind('cookie-port21-no-httponly')).toBe('cookie-no-httponly');
    expect(findingKind('tls-cert-expired')).toBe('tls-cert-expired');
  });
});

// ---------------------------------------------------------------------------
// The mapping and the knowledge base must stay in sync with checks.ts.
// ---------------------------------------------------------------------------
describe('mapping and knowledge-base integrity', () => {
  /**
   * Every finding kind lib/checks.ts can emit. Kept here as an explicit
   * contract: if a new check is added without a citation, this fails.
   */
  const FINDING_KINDS_FROM_CHECKS = [
    'tls-no-https',
    'tls-cert-expired',
    'tls-cert-expiring-soon',
    'tls-http-not-redirected',
    'headers-served-over-http',
    'headers-unreachable', // intentionally uncited: a failed measurement
    'header-missing-hsts',
    'header-missing-csp',
    'header-missing-x-frame-options',
    'header-missing-x-content-type-options',
    'header-missing-referrer-policy',
    'email-no-spf',
    'email-spf-permissive',
    'email-no-dmarc',
    'email-dmarc-p-none',
    'cookie-no-httponly',
    'cookie-no-secure',
    'cookie-no-samesite',
  ];

  const INTENTIONALLY_UNCITED = ['headers-unreachable'];

  it('maps every finding kind the checks can produce', () => {
    const expected = FINDING_KINDS_FROM_CHECKS.filter((k) => !INTENTIONALLY_UNCITED.includes(k));
    expect(Object.keys(GROUNDING_MAP).sort()).toEqual(expected.sort());
  });

  it('points every mapping at a knowledge-base entry that exists', () => {
    const ids = new Set(kb.map((e) => e.id));
    for (const [kind, kbId] of Object.entries(GROUNDING_MAP)) {
      expect(ids.has(kbId), `${kind} -> missing KB entry ${kbId}`).toBe(true);
    }
  });

  it('has no unused knowledge-base entries', () => {
    // Every entry must be reachable from the map. An unreachable entry is
    // dead data that inflates the "grounded in N sources" claim — and, in
    // the keyword-matching version, was what caused the wrong citations.
    const cited = new Set(Object.values(GROUNDING_MAP));
    const unused = kb.map((e) => e.id).filter((id) => !cited.has(id));
    expect(unused).toEqual([]);
  });

  it('gives every knowledge-base entry a real https reference and a known severity', () => {
    for (const entry of kb) {
      expect(entry.reference, entry.id).toMatch(/^https:\/\//);
      expect(ALL_SEVERITIES, entry.id).toContain(entry.severity as Severity);
      expect(entry.summary.length, entry.id).toBeGreaterThan(20);
      expect(entry.remediation.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('reports the knowledge base severity as citedSeverity, separately from the finding', () => {
    // The finding says medium (expires soon); the KB's generic entry for an
    // expiring certificate is also medium — but the two are reported
    // independently so a future mismatch is visible instead of silently
    // overwriting the observed severity.
    const result = groundFinding(
      makeFinding({ id: 'tls-cert-expiring-soon', severity: 'medium', detail: 'expires in 5 day(s).' }),
    );
    expect(result.citedSeverity).toBe('medium');
    expect(result.finding.severity).toBe('medium');
  });
});

// ---------------------------------------------------------------------------
// Unknown / uncited findings.
// ---------------------------------------------------------------------------
describe('findings with no citation', () => {
  it('falls back to the generic source and keeps severity for an unmapped id', () => {
    const result = groundFinding(
      makeFinding({ id: 'brand-new-check-nobody-mapped', severity: 'low', detail: 'whatever' }),
    );
    expect(result.sourceUrl).toBe(GENERIC_FALLBACK);
    expect(result.finding.severity).toBe('low');
    expect(result.citedSeverity).toBe('low');
  });

  it('leaves the unreachable-homepage finding uncited and at info severity', () => {
    const result = groundFinding(
      makeFinding({
        id: 'headers-unreachable',
        category: 'headers',
        severity: 'info',
        title: 'Could not check the security headers',
        detail: 'Neither HTTPS nor HTTP returned a response within the timeout.',
      }),
    );
    expect(result.sourceUrl).toBe(GENERIC_FALLBACK);
    expect(result.finding.severity).toBe('info');
  });
});
