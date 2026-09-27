import { describe, it, expect } from 'vitest';
import { computeRiskScore, buildActionPlan } from './score';
import type { Severity } from './types';

describe('computeRiskScore', () => {
  it('returns 0 for no findings', () => {
    expect(computeRiskScore([])).toBe(0);
  });

  it('uses the documented weight for a single critical finding', () => {
    expect(computeRiskScore(['critical'])).toBe(40);
  });

  it('uses the documented weight for a single high finding', () => {
    expect(computeRiskScore(['high'])).toBe(25);
  });

  it('uses the documented weight for a single medium finding', () => {
    expect(computeRiskScore(['medium'])).toBe(12);
  });

  it('uses the documented weight for a single low finding', () => {
    expect(computeRiskScore(['low'])).toBe(5);
  });

  it('uses the documented weight for a single info finding', () => {
    expect(computeRiskScore(['info'])).toBe(1);
  });

  it('sums weights across mixed severities', () => {
    const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
    // 40 + 25 + 12 + 5 + 1 = 83
    expect(computeRiskScore(severities)).toBe(83);
  });

  it('caps the total at 100 when the sum would exceed it', () => {
    const severities: Severity[] = ['critical', 'critical', 'critical']; // 120 raw
    expect(computeRiskScore(severities)).toBe(100);
  });

  it('caps exactly at the 100 boundary', () => {
    // 40 + 40 + 12 + 5 + 1 + 1 + 1 = 100 exactly
    const severities: Severity[] = ['critical', 'critical', 'medium', 'low', 'info', 'info', 'info'];
    expect(computeRiskScore(severities)).toBe(100);
  });
});

describe('buildActionPlan', () => {
  it('buckets critical and high findings into today', () => {
    const plan = buildActionPlan([
      { severity: 'critical', title: 'Cert expired', fix: 'Renew the cert' },
      { severity: 'high', title: 'No HTTPS redirect', fix: 'Force HTTPS' },
    ]);
    expect(plan.today).toEqual(['Renew the cert', 'Force HTTPS']);
    expect(plan.thisWeek).toEqual([]);
    expect(plan.thisMonth).toEqual([]);
  });

  it('buckets medium findings into thisWeek', () => {
    const plan = buildActionPlan([{ severity: 'medium', title: 'Missing headers', fix: 'Add CSP' }]);
    expect(plan.thisWeek).toEqual(['Add CSP']);
    expect(plan.today).toEqual([]);
    expect(plan.thisMonth).toEqual([]);
  });

  it('buckets low and info findings into thisMonth', () => {
    const plan = buildActionPlan([
      { severity: 'low', title: 'Missing SameSite', fix: 'Set SameSite=Lax' },
      { severity: 'info', title: 'DNSSEC disabled', fix: 'Enable DNSSEC' },
    ]);
    expect(plan.thisMonth).toEqual(['Set SameSite=Lax', 'Enable DNSSEC']);
    expect(plan.today).toEqual([]);
    expect(plan.thisWeek).toEqual([]);
  });

  it('uses fix text when present', () => {
    const plan = buildActionPlan([{ severity: 'critical', title: 'Title text', fix: 'Fix text' }]);
    expect(plan.today).toEqual(['Fix text']);
  });

  it('falls back to title when fix is undefined', () => {
    const plan = buildActionPlan([{ severity: 'critical', title: 'Title text', fix: undefined }]);
    expect(plan.today).toEqual(['Title text']);
  });

  it('falls back to title when fix is an empty string', () => {
    const plan = buildActionPlan([{ severity: 'high', title: 'Title text', fix: '' }]);
    expect(plan.today).toEqual(['Title text']);
  });

  it('falls back to title when fix is whitespace-only', () => {
    const plan = buildActionPlan([{ severity: 'medium', title: 'Title text', fix: '   ' }]);
    expect(plan.thisWeek).toEqual(['Title text']);
  });

  it('preserves input order within a bucket', () => {
    const plan = buildActionPlan([
      { severity: 'high', title: 'A', fix: 'fix-a' },
      { severity: 'critical', title: 'B', fix: 'fix-b' },
    ]);
    expect(plan.today).toEqual(['fix-a', 'fix-b']);
  });
});
