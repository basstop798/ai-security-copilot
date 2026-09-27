import { describe, it, expect } from 'vitest';
import { validateDomainInput, isPrivateOrReservedIp } from './validate';

describe('validateDomainInput', () => {
  it('accepts a bare domain', () => {
    expect(validateDomainInput('example.com')).toBe('example.com');
  });

  it('strips protocol and path from a URL, returning the bare host', () => {
    expect(validateDomainInput('https://example.com/path')).toBe('example.com');
  });

  it('strips a leading http:// too', () => {
    expect(validateDomainInput('http://example.com/some/path?x=1')).toBe('example.com');
  });

  it('lowercases and trims the input', () => {
    expect(validateDomainInput('  Example.COM  ')).toBe('example.com');
  });

  it('strips a trailing port', () => {
    expect(validateDomainInput('example.com:8080')).toBe('example.com');
  });

  it('rejects localhost', () => {
    expect(() => validateDomainInput('localhost')).toThrow();
  });

  it('rejects *.localhost', () => {
    expect(() => validateDomainInput('foo.localhost')).toThrow();
  });

  it('rejects a raw IPv4 address', () => {
    expect(() => validateDomainInput('8.8.8.8')).toThrow();
  });

  it('rejects a raw private IPv4 address', () => {
    expect(() => validateDomainInput('127.0.0.1')).toThrow();
  });

  it('rejects an IPv6 literal (::1)', () => {
    expect(() => validateDomainInput('::1')).toThrow();
  });

  it('rejects an IPv6 literal (full form)', () => {
    expect(() => validateDomainInput('2001:db8::1')).toThrow();
  });

  it('rejects an IPv6 literal (fe80 link-local form)', () => {
    expect(() => validateDomainInput('fe80::1')).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => validateDomainInput('')).toThrow();
  });

  it('rejects whitespace-only input', () => {
    expect(() => validateDomainInput('   ')).toThrow();
  });

  it('rejects a garbage string with no dot', () => {
    expect(() => validateDomainInput('notadomain')).toThrow();
  });

  it('rejects a garbage string with invalid characters', () => {
    expect(() => validateDomainInput('exa mple.com')).toThrow();
  });
});

describe('isPrivateOrReservedIp', () => {
  it('flags loopback 127.0.0.1', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
  });

  it('flags RFC1918 10.x', () => {
    expect(isPrivateOrReservedIp('10.0.0.5')).toBe(true);
  });

  it('flags RFC1918 172.16-31.x at the low boundary', () => {
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
  });

  it('flags RFC1918 172.16-31.x at the high boundary', () => {
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
  });

  it('does not flag 172.32.x (outside the private range)', () => {
    expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false);
  });

  it('does not flag 172.15.x (outside the private range)', () => {
    expect(isPrivateOrReservedIp('172.15.255.255')).toBe(false);
  });

  it('flags RFC1918 192.168.x', () => {
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
  });

  it('flags link-local 169.254.x', () => {
    expect(isPrivateOrReservedIp('169.254.1.1')).toBe(true);
  });

  it('flags the cloud metadata IP 169.254.169.254', () => {
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
  });

  it('flags IPv6 loopback ::1', () => {
    expect(isPrivateOrReservedIp('::1')).toBe(true);
  });

  it('flags IPv6 unique-local fc00::/7 (fc prefix)', () => {
    expect(isPrivateOrReservedIp('fc00::1')).toBe(true);
  });

  it('flags IPv6 unique-local fc00::/7 (fd prefix)', () => {
    expect(isPrivateOrReservedIp('fd12:3456::1')).toBe(true);
  });

  it('flags IPv6 link-local fe80::', () => {
    expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
  });

  it('flags IPv6 link-local across the full fe80::/10 range (fe95::)', () => {
    expect(isPrivateOrReservedIp('fe95::1')).toBe(true);
  });

  it('flags IPv6 link-local at the fe80::/10 upper boundary (febf::)', () => {
    expect(isPrivateOrReservedIp('febf::1')).toBe(true);
  });

  it('does not flag the deprecated site-local block just past fe80::/10 (fec0::)', () => {
    expect(isPrivateOrReservedIp('fec0::1')).toBe(false);
  });

  it('does not flag a normal public IPv4 (8.8.8.8)', () => {
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
  });

  it('does not flag another normal public IPv4 (1.1.1.1)', () => {
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
  });

  it('does not flag a normal public IPv6 address', () => {
    expect(isPrivateOrReservedIp('2606:4700:4700::1111')).toBe(false);
  });
});
