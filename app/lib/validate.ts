/**
 * Input validation + SSRF guard. Must run BEFORE any network call in
 * checks.ts. See CLAUDE.md "Safety gates".
 */

import { Resolver } from 'node:dns';

const DNS_SERVERS = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Strip protocol/path/port from user input and return a bare hostname.
 * Throws on IPs, localhost, or anything that isn't a plausible public
 * registrable domain (must contain a dot, letters/digits/hyphens only).
 */
export function validateDomainInput(raw: string): string {
  let value = raw.trim().toLowerCase();
  if (!value) throw new Error('Domain is required.');

  value = value.replace(/^https?:\/\//, '');
  value = value.split('/')[0];
  value = value.split(':')[0]; // drop a port if present

  if (!value) throw new Error('Domain is required.');
  if (value === 'localhost' || value.endsWith('.localhost')) {
    throw new Error('localhost is not allowed.');
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    throw new Error('IP addresses are not allowed — enter a domain name.');
  }
  if (value.includes(':')) {
    throw new Error('IPv6 literals are not allowed — enter a domain name.');
  }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)) {
    throw new Error('That does not look like a valid domain (e.g. example.com).');
  }

  return value;
}

function lookup(resolver: Resolver, hostname: string, family: 4 | 6): Promise<string[]> {
  return new Promise((resolve) => {
    resolver.resolve(hostname, family === 4 ? 'A' : 'AAAA', (err, addresses) => {
      resolve(err ? [] : addresses);
    });
  });
}

/** True if the IP is loopback, private (RFC1918), link-local, CGNAT or the cloud metadata IP. */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (ip === '169.254.169.254') return true; // cloud metadata
  if (ip.includes(':')) {
    // IPv6: loopback, unique local (fc00::/7), link-local (fe80::/10)
    const lower = ip.toLowerCase();
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true; // malformed -> reject
  const [a, b] = parts;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 169 && b === 254) return true; // link-local
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT (RFC6598)
  if (a === 0) return true;
  return false;
}

/**
 * Resolve the hostname and throw if ANY resolved address is private/reserved.
 * Call this once per hostname before the first outbound request, and again
 * after following a redirect (checks.ts caps redirects at 3 and re-validates
 * each hop's hostname through this same function).
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const resolver = new Resolver();
  resolver.setServers(DNS_SERVERS);

  const [v4, v6] = await Promise.all([
    lookup(resolver, hostname, 4),
    lookup(resolver, hostname, 6),
  ]);
  const addresses = [...v4, ...v6];

  if (addresses.length === 0) {
    throw new Error(`Could not resolve "${hostname}" — check the domain and try again.`);
  }
  if (addresses.some(isPrivateOrReservedIp)) {
    throw new Error(`"${hostname}" resolves to a private/internal address — refusing to check it.`);
  }
}
