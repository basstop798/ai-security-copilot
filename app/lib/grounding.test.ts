import { describe, it, expect } from 'vitest';
import { worstOf, groundFinding } from './grounding';
import type { Finding, Severity } from './types';

describe('worstOf', () => {
  const order: Severity[] = ['info', 'low', 'medium', 'high', 'critical'];

  it('ranks critical above everything', () => {
    for (const other of order) {
      expect(worstOf('critical', other)).toBe('critical');
      expect(worstOf(other, 'critical')).toBe('critical');
    }
  });

  it('ranks high above medium/low/info but below critical', () => {
    expect(worstOf('high', 'medium')).toBe('high');
    expect(worstOf('medium', 'high')).toBe('high');
    expect(worstOf('high', 'low')).toBe('high');
    expect(worstOf('high', 'info')).toBe('high');
    expect(worstOf('high', 'critical')).toBe('critical');
  });

  it('ranks medium above low/info but below high', () => {
    expect(worstOf('medium', 'low')).toBe('medium');
    expect(worstOf('low', 'medium')).toBe('medium');
    expect(worstOf('medium', 'info')).toBe('medium');
    expect(worstOf('medium', 'high')).toBe('high');
  });

  it('ranks low above info but below medium', () => {
    expect(worstOf('low', 'info')).toBe('low');
    expect(worstOf('info', 'low')).toBe('low');
    expect(worstOf('low', 'medium')).toBe('medium');
  });

  it('is order-independent (commutative) for every pair', () => {
    for (const a of order) {
      for (const b of order) {
        expect(worstOf(a, b)).toBe(worstOf(b, a));
      }
    }
  });

  it('returns the same severity when both arguments are equal', () => {
    for (const s of order) {
      expect(worstOf(s, s)).toBe(s);
    }
  });
});

describe('groundFinding', () => {
  function makeFinding(overrides: Partial<Finding>): Finding {
    return {
      id: 'test-finding',
      category: 'tls',
      severity: 'low',
      title: 'TLS certificate expired',
      detail: 'Certificate expired 10 days ago.',
      ...overrides,
    };
  }

  it('matches a real KB keyword ("certificate"/"expired") and returns a real (non-fallback) sourceUrl', () => {
    const finding = makeFinding({
      severity: 'low',
      title: 'TLS certificate expired',
      detail: 'The certificate expired 10 days ago.',
    });
    const result = groundFinding(finding);
    expect(result.sourceUrl).not.toBe('https://cwe.mitre.org/');
    expect(result.sourceUrl).toBe('https://cwe.mitre.org/data/definitions/295.html');
    expect(result.citedSeverity).toBe('critical');
  });

  it('matches a real KB keyword ("cookie"/"samesite") and returns that entry reference', () => {
    const finding = makeFinding({
      category: 'cookies',
      severity: 'low',
      title: 'Session cookie missing SameSite',
      detail: 'The cookie has no SameSite attribute set.',
    });
    const result = groundFinding(finding);
    expect(result.sourceUrl).not.toBe('https://cwe.mitre.org/');
    expect(result.sourceUrl).toBe('https://cwe.mitre.org/data/definitions/352.html');
  });

  it('never returns a severity lower than the input finding severity (raises low input to critical match)', () => {
    const finding = makeFinding({ severity: 'low', title: 'Cert problem', detail: 'certificate expired' });
    const result = groundFinding(finding);
    // KB entry for certificate/expired is "critical" — worse than the input "low".
    expect(result.finding.severity).toBe('critical');
  });

  it('never downgrades a severity that is already worse than the matched KB entry', () => {
    // "samesite" KB entry is severity "low", but the input finding is "critical".
    const finding = makeFinding({
      category: 'cookies',
      severity: 'critical',
      title: 'Session cookie missing SameSite',
      detail: 'The cookie has no SameSite attribute set.',
    });
    const result = groundFinding(finding);
    expect(result.finding.severity).toBe('critical');
  });

  it('falls back to the generic sourceUrl and keeps severity unchanged when no keyword matches', () => {
    const finding = makeFinding({
      severity: 'medium',
      title: 'zzz-no-match-xyz',
      detail: 'zzz-no-match-xyz has no relation to anything in the KB',
    });
    const result = groundFinding(finding);
    expect(result.sourceUrl).toBe('https://cwe.mitre.org/');
    expect(result.citedSeverity).toBe('medium');
    expect(result.finding.severity).toBe('medium');
  });
});
