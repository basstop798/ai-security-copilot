/**
 * Passive security checks — no port scanning, no active probing beyond what
 * a normal browser visit already does. Four modules only (see CLAUDE.md).
 *
 * Every function here returns Finding[] with a DETERMINISTIC severity.
 * The LLM never sees raw headers/cookies — only these structured Findings.
 */

import * as tls from 'node:tls';
import { Resolver } from 'node:dns';
import type { Finding } from './types';

const DNS_SERVERS = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function makeResolver(): Resolver {
  // The system resolver on this dev machine is 127.0.0.1 and refuses
  // connections (verified 26 Sep) — always use explicit public resolvers.
  const resolver = new Resolver();
  resolver.setServers(DNS_SERVERS);
  return resolver;
}

function resolveTxt(resolver: Resolver, hostname: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    resolver.resolveTxt(hostname, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
}

// ---------------------------------------------------------------------------
// 1. TLS / certificate
// ---------------------------------------------------------------------------

export async function checkTls(hostname: string): Promise<Finding[]> {
  const findings: Finding[] = [];

  const tlsResult = await new Promise<{
    ok: boolean;
    daysRemaining?: number;
    error?: string;
  }>((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false, timeout: 8000 },
      () => {
        const cert = socket.getPeerCertificate();
        const daysRemaining = cert?.valid_to
          ? Math.round((Date.parse(cert.valid_to) - Date.now()) / 86_400_000)
          : undefined;
        resolve({ ok: true, daysRemaining });
        socket.end();
      },
    );
    socket.on('error', (err) => resolve({ ok: false, error: (err as Error).message }));
    socket.on('timeout', () => {
      resolve({ ok: false, error: 'timeout' });
      socket.destroy();
    });
  });

  if (!tlsResult.ok) {
    findings.push({
      id: 'tls-no-https',
      category: 'tls',
      severity: 'high',
      title: 'Site is not reachable over HTTPS',
      detail: `Could not establish a TLS connection on port 443 (${tlsResult.error ?? 'unknown error'}).`,
    });
  } else if (typeof tlsResult.daysRemaining === 'number' && tlsResult.daysRemaining < 0) {
    findings.push({
      id: 'tls-cert-expired',
      category: 'tls',
      severity: 'critical',
      title: 'TLS certificate has expired',
      detail: `Certificate expired ${Math.abs(tlsResult.daysRemaining)} day(s) ago.`,
    });
  } else if (typeof tlsResult.daysRemaining === 'number' && tlsResult.daysRemaining < 30) {
    findings.push({
      id: 'tls-cert-expiring-soon',
      category: 'tls',
      severity: 'medium',
      title: 'TLS certificate expires soon',
      detail: `Certificate expires in ${tlsResult.daysRemaining} day(s).`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// 2. Security headers (one GET of the homepage)
// ---------------------------------------------------------------------------

const REQUIRED_HEADERS: { header: string; id: string }[] = [
  { header: 'strict-transport-security', id: 'header-missing-hsts' },
  { header: 'content-security-policy', id: 'header-missing-csp' },
  { header: 'x-frame-options', id: 'header-missing-x-frame-options' },
  { header: 'x-content-type-options', id: 'header-missing-x-content-type-options' },
  { header: 'referrer-policy', id: 'header-missing-referrer-policy' },
];

export async function fetchHomepage(
  hostname: string,
): Promise<{ response: Response; usedHttps: boolean } | null> {
  for (const proto of ['https', 'http'] as const) {
    try {
      const response = await fetch(`${proto}://${hostname}/`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });
      return { response, usedHttps: proto === 'https' };
    } catch {
      // try next protocol
    }
  }
  return null;
}

export async function checkHeaders(
  hostname: string,
  fetched?: { response: Response; usedHttps: boolean } | null,
): Promise<Finding[]> {
  const result = fetched !== undefined ? fetched : await fetchHomepage(hostname);
  if (!result) {
    return [
      {
        id: 'headers-unreachable',
        category: 'headers',
        severity: 'high',
        title: 'Homepage did not respond',
        detail: 'Neither HTTPS nor HTTP returned a response within the timeout.',
      },
    ];
  }

  const { response, usedHttps } = result;
  const findings: Finding[] = [];

  if (!usedHttps) {
    findings.push({
      id: 'headers-served-over-http',
      category: 'headers',
      severity: 'high',
      title: 'Site served over plain HTTP',
      detail: 'The homepage responded over HTTP; HTTPS was not available or did not redirect.',
    });
  }

  const missing = REQUIRED_HEADERS.filter(({ header }) => !response.headers.get(header));
  for (const { header, id } of missing) {
    findings.push({
      id,
      category: 'headers',
      severity: 'medium',
      title: `Missing ${header} header`,
      detail: `The response did not include a ${header} header.`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// 3. Email authentication (SPF / DMARC)
// ---------------------------------------------------------------------------

export async function checkEmailAuth(domain: string): Promise<Finding[]> {
  const resolver = makeResolver();
  const findings: Finding[] = [];

  let spfRecords: string[] = [];
  try {
    const records = await resolveTxt(resolver, domain);
    spfRecords = records.map((r) => r.join('')).filter((t) => t.startsWith('v=spf1'));
  } catch {
    spfRecords = [];
  }

  if (spfRecords.length === 0) {
    findings.push({
      id: 'email-no-spf',
      category: 'email',
      severity: 'medium',
      title: 'No SPF record',
      detail: `No TXT record starting with "v=spf1" was found for ${domain}.`,
    });
  } else if (/[+]all\b/.test(spfRecords[0])) {
    findings.push({
      id: 'email-spf-permissive',
      category: 'email',
      severity: 'high',
      title: 'SPF record authorises any sender (+all)',
      detail: `SPF record ends in +all: "${spfRecords[0]}".`,
    });
  }

  let dmarcRecords: string[] = [];
  try {
    const records = await resolveTxt(resolver, `_dmarc.${domain}`);
    dmarcRecords = records.map((r) => r.join('')).filter((t) => t.startsWith('v=DMARC1'));
  } catch {
    dmarcRecords = [];
  }

  if (dmarcRecords.length === 0) {
    findings.push({
      id: 'email-no-dmarc',
      category: 'email',
      severity: 'medium',
      title: 'No DMARC record',
      detail: `No TXT record starting with "v=DMARC1" was found at _dmarc.${domain}.`,
    });
  } else {
    const policyMatch = dmarcRecords[0].match(/p=(\w+)/);
    const policy = policyMatch?.[1];
    if (policy === 'none') {
      findings.push({
        id: 'email-dmarc-p-none',
        category: 'email',
        severity: 'low',
        title: 'DMARC policy is p=none (monitoring only)',
        detail: `DMARC record: "${dmarcRecords[0]}".`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// 4. Cookies (from the same homepage GET)
// ---------------------------------------------------------------------------

export async function checkCookies(
  hostname: string,
  fetched?: { response: Response; usedHttps: boolean } | null,
): Promise<Finding[]> {
  const result = fetched !== undefined ? fetched : await fetchHomepage(hostname);
  if (!result) return [];

  const { response } = result;
  const rawCookies: string[] =
    typeof (response.headers as { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (response.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : (() => {
          const single = response.headers.get('set-cookie');
          return single ? [single] : [];
        })();

  const findings: Finding[] = [];
  for (const cookie of rawCookies) {
    const name = cookie.split('=')[0]?.trim() || 'cookie';
    const lower = cookie.toLowerCase();

    if (!lower.includes('httponly')) {
      findings.push({
        id: `cookie-${name}-no-httponly`,
        category: 'cookies',
        severity: 'medium',
        title: `Cookie "${name}" missing HttpOnly`,
        detail: `Set-Cookie for "${name}" does not include the HttpOnly flag.`,
      });
    }
    if (!lower.includes('secure')) {
      findings.push({
        id: `cookie-${name}-no-secure`,
        category: 'cookies',
        severity: 'medium',
        title: `Cookie "${name}" missing Secure flag`,
        detail: `Set-Cookie for "${name}" does not include the Secure flag.`,
      });
    }
    if (!lower.includes('samesite')) {
      findings.push({
        id: `cookie-${name}-no-samesite`,
        category: 'cookies',
        severity: 'low',
        title: `Cookie "${name}" missing SameSite`,
        detail: `Set-Cookie for "${name}" does not include a SameSite attribute.`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Orchestration: run all four, sharing one homepage fetch between headers/cookies.
// ---------------------------------------------------------------------------

export async function runAllChecks(hostname: string): Promise<Finding[]> {
  const homepage = await fetchHomepage(hostname);
  const [tlsFindings, headerFindings, emailFindings, cookieFindings] = await Promise.all([
    checkTls(hostname),
    checkHeaders(hostname, homepage),
    checkEmailAuth(hostname),
    checkCookies(hostname, homepage),
  ]);
  return [...tlsFindings, ...headerFindings, ...emailFindings, ...cookieFindings];
}
