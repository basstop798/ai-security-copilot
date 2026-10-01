/**
 * Offline demo fallback — a REAL grounded result captured on 26 Sep 2026 by
 * running the actual pipeline (checks.ts + grounding.ts) against
 * demo.testfire.net (IBM's public "Altoro Mutual" security-testing site).
 * Not synthetic data: this is a snapshot of a genuine passive scan.
 *
 * Served by /api/check ONLY for this one domain, and only when its live
 * check fails (target down, network issue), so a demo of a known-vulnerable
 * site still shows a full, real report. Any other domain gets a live result
 * or an error — pre-captured data is never presented as a live scan, and the
 * UI labels it when it is used.
 */

import type { Finding } from './types';

export const DEMO_DOMAIN = 'demo.testfire.net';

/** Raw grounded findings (pre-LLM), captured from a real run. */
export const DEMO_GROUNDED_FINDINGS: { finding: Finding; sourceUrl: string }[] = [
  {
    finding: {
      id: 'tls-cert-expired',
      category: 'tls',
      severity: 'critical',
      title: 'TLS certificate has expired',
      detail: 'Certificate expired 97 day(s) ago.',
    },
    sourceUrl: 'https://cwe.mitre.org/data/definitions/295.html',
  },
  {
    finding: {
      id: 'headers-served-over-http',
      category: 'headers',
      severity: 'high',
      title: 'Site served over plain HTTP',
      detail: 'The homepage responded over HTTP; HTTPS was not available or did not redirect.',
    },
    sourceUrl: 'https://cwe.mitre.org/data/definitions/319.html',
  },
  {
    finding: {
      id: 'header-missing-hsts',
      category: 'headers',
      severity: 'medium',
      title: 'Missing strict-transport-security header',
      detail: 'The response did not include a strict-transport-security header.',
    },
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    finding: {
      id: 'header-missing-csp',
      category: 'headers',
      severity: 'medium',
      title: 'Missing content-security-policy header',
      detail: 'The response did not include a content-security-policy header.',
    },
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    finding: {
      id: 'header-missing-x-frame-options',
      category: 'headers',
      severity: 'medium',
      title: 'Missing x-frame-options header',
      detail: 'The response did not include a x-frame-options header.',
    },
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    finding: {
      id: 'header-missing-x-content-type-options',
      category: 'headers',
      severity: 'medium',
      title: 'Missing x-content-type-options header',
      detail: 'The response did not include a x-content-type-options header.',
    },
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    finding: {
      id: 'header-missing-referrer-policy',
      category: 'headers',
      severity: 'medium',
      title: 'Missing referrer-policy header',
      detail: 'The response did not include a referrer-policy header.',
    },
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
  },
  {
    finding: {
      id: 'email-no-spf',
      category: 'email',
      severity: 'medium',
      title: 'No SPF record',
      detail: 'No TXT record starting with "v=spf1" was found for demo.testfire.net.',
    },
    sourceUrl: 'https://datatracker.ietf.org/doc/html/rfc7208',
  },
  {
    finding: {
      id: 'email-no-dmarc',
      category: 'email',
      severity: 'medium',
      title: 'No DMARC record',
      detail: 'No TXT record starting with "v=DMARC1" was found at _dmarc.demo.testfire.net.',
    },
    sourceUrl: 'https://datatracker.ietf.org/doc/html/rfc7489',
  },
  {
    finding: {
      id: 'cookie-JSESSIONID-no-secure',
      category: 'cookies',
      severity: 'medium',
      title: 'Cookie "JSESSIONID" missing Secure flag',
      detail: 'Set-Cookie for "JSESSIONID" does not include the Secure flag.',
    },
    sourceUrl: 'https://cwe.mitre.org/data/definitions/614.html',
  },
  {
    finding: {
      id: 'cookie-JSESSIONID-no-samesite',
      category: 'cookies',
      severity: 'low',
      title: 'Cookie "JSESSIONID" missing SameSite',
      detail: 'Set-Cookie for "JSESSIONID" does not include a SameSite attribute.',
    },
    sourceUrl: 'https://cwe.mitre.org/data/definitions/352.html',
  },
];
