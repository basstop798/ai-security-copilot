import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./validate', () => ({
  assertPublicHostname: vi.fn(async () => {}),
}));

import { checkHttpRedirect, fetchHomepage } from './checks';
import { assertPublicHostname } from './validate';

const mockedAssertPublicHostname = vi.mocked(assertPublicHostname);

describe('checkHttpRedirect', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns no finding when HTTP redirects to HTTPS', async () => {
    global.fetch = vi.fn(async () =>
      new Response(null, { status: 301, headers: { location: 'https://example.com/' } }),
    ) as unknown as typeof fetch;

    expect(await checkHttpRedirect('example.com')).toEqual([]);
  });

  it('flags a finding when HTTP serves content without redirecting at all', async () => {
    global.fetch = vi.fn(async () => new Response('hello', { status: 200 })) as unknown as typeof fetch;

    const findings = await checkHttpRedirect('example.com');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ id: 'tls-http-not-redirected', category: 'tls', severity: 'medium' });
  });

  it('flags a finding when HTTP redirects somewhere that is still not HTTPS', async () => {
    global.fetch = vi.fn(async () =>
      new Response(null, { status: 302, headers: { location: 'http://example.com/other' } }),
    ) as unknown as typeof fetch;

    const findings = await checkHttpRedirect('example.com');
    expect(findings.map((f) => f.id)).toEqual(['tls-http-not-redirected']);
  });

  it('is silent (no finding) when HTTP itself is unreachable', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch;

    expect(await checkHttpRedirect('example.com')).toEqual([]);
  });
});

describe('fetchHomepage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockedAssertPublicHostname.mockReset();
    mockedAssertPublicHostname.mockImplementation(async () => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('follows a redirect chain and reads headers from the FINAL destination, not the redirect hop', async () => {
    const calls: string[] = [];
    global.fetch = vi.fn(async (url: string) => {
      calls.push(url);
      if (url === 'https://example.com/') {
        return new Response(null, { status: 301, headers: { location: 'https://example.com/final' } });
      }
      if (url === 'https://example.com/final') {
        return new Response('ok', { status: 200, headers: { 'x-marker': 'final-page' } });
      }
      throw new Error(`unexpected url in test: ${url}`);
    }) as unknown as typeof fetch;

    const result = await fetchHomepage('example.com');

    expect(result).not.toBeNull();
    expect(result!.usedHttps).toBe(true);
    expect(result!.response.headers.get('x-marker')).toBe('final-page');
    expect(calls).toEqual(['https://example.com/', 'https://example.com/final']);
  });

  it('re-validates the SSRF guard on every redirect hop and refuses to follow one into a private address', async () => {
    mockedAssertPublicHostname.mockImplementation(async (hostname: string) => {
      if (hostname === 'internal.example') throw new Error('private address');
    });

    const calls: string[] = [];
    global.fetch = vi.fn(async (url: string) => {
      calls.push(url);
      if (url === 'https://example.com/') {
        return new Response(null, { status: 302, headers: { location: 'https://internal.example/' } });
      }
      if (url === 'http://example.com/') {
        return new Response('fallback', { status: 200 });
      }
      throw new Error(`unexpected url in test: ${url}`);
    }) as unknown as typeof fetch;

    const result = await fetchHomepage('example.com');

    // Must never have actually requested the redirect target.
    expect(calls).not.toContain('https://internal.example/');
    // Falls back to plain HTTP instead of surfacing the blocked https attempt.
    expect(result).not.toBeNull();
    expect(result!.usedHttps).toBe(false);
  });

  it('gives up after MAX_REDIRECT_HOPS redirects on one protocol instead of following forever', async () => {
    let httpsCallCount = 0;
    global.fetch = vi.fn(async (url: string) => {
      if (url.startsWith('https://')) {
        httpsCallCount += 1;
        return new Response(null, {
          status: 301,
          headers: { location: `https://example.com/hop${httpsCallCount}` },
        });
      }
      return new Response('fallback', { status: 200 });
    }) as unknown as typeof fetch;

    const result = await fetchHomepage('example.com');

    expect(httpsCallCount).toBe(4); // 1 initial request + 3 redirects followed, then bail
    expect(result).not.toBeNull();
    expect(result!.usedHttps).toBe(false);
  });
});
