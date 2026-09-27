import { describe, it, expect } from 'vitest';
import { parseLlmOutput, assertKnownFindingIds } from './schema';
import type { LlmReport } from './schema';

const validReport = {
  language: 'en',
  findings: [{ id: 'tls-cert-expired', impact: 'Visitors see a warning.', fix: 'Renew the certificate.' }],
};

describe('parseLlmOutput', () => {
  it('accepts a valid parsed object', () => {
    const result = parseLlmOutput(validReport);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('en');
      expect(result.data.findings).toHaveLength(1);
      expect(result.data.findings[0].id).toBe('tls-cert-expired');
    }
  });

  it('accepts a JSON string of the same shape', () => {
    const result = parseLlmOutput(JSON.stringify(validReport));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.findings[0].fix).toBe('Renew the certificate.');
    }
  });

  it('rejects an invalid JSON string', () => {
    const result = parseLlmOutput('{ this is not json');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/not valid JSON/i);
    }
  });

  it('rejects the wrong shape (missing findings)', () => {
    const result = parseLlmOutput({ language: 'en' });
    expect(result.success).toBe(false);
  });

  it('rejects the wrong shape (missing language)', () => {
    const result = parseLlmOutput({ findings: validReport.findings });
    expect(result.success).toBe(false);
  });

  it('rejects an empty findings array', () => {
    const result = parseLlmOutput({ language: 'en', findings: [] });
    expect(result.success).toBe(false);
  });

  it('rejects an unsupported language', () => {
    const result = parseLlmOutput({ ...validReport, language: 'de' });
    expect(result.success).toBe(false);
  });

  it('rejects extra unexpected top-level keys (strict envelope)', () => {
    const result = parseLlmOutput({ ...validReport, extraField: 'nope' });
    expect(result.success).toBe(false);
  });

  it('rejects a hallucinated severity field on a finding (strict finding schema)', () => {
    const result = parseLlmOutput({
      language: 'en',
      findings: [
        {
          id: 'tls-cert-expired',
          impact: 'Visitors see a warning.',
          fix: 'Renew the certificate.',
          severity: 'critical',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a hallucinated category field on a finding (strict finding schema)', () => {
    const result = parseLlmOutput({
      language: 'en',
      findings: [
        {
          id: 'tls-cert-expired',
          impact: 'Visitors see a warning.',
          fix: 'Renew the certificate.',
          category: 'tls',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('assertKnownFindingIds', () => {
  const report: LlmReport = {
    language: 'en',
    findings: [
      { id: 'tls-cert-expired', impact: 'x', fix: 'y' },
      { id: 'headers-missing-csp', impact: 'x', fix: 'y' },
    ],
  };

  it('does not throw when all ids are known', () => {
    expect(() => assertKnownFindingIds(report, ['tls-cert-expired', 'headers-missing-csp', 'cookies-no-httponly'])).not.toThrow();
  });

  it('throws when a finding id is not in the known list', () => {
    expect(() => assertKnownFindingIds(report, ['tls-cert-expired'])).toThrow(/unknown finding id/i);
  });

  it('throws and names the offending id', () => {
    expect(() => assertKnownFindingIds(report, ['tls-cert-expired'])).toThrow(/headers-missing-csp/);
  });
});
