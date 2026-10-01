import { describe, it, expect } from 'vitest';
import {
  findingText,
  localizedTitle,
  cookieNameFromId,
  LOCALIZED_FINDING_KINDS,
} from './finding-text';
import { GROUNDING_MAP } from './grounding';
import type { ReportLanguage } from './types';

const LANGUAGES: ReportLanguage[] = ['ar', 'fr', 'en'];

/** Every finding kind checks.ts can emit, including the uncited one. */
const ALL_FINDING_KINDS = [...Object.keys(GROUNDING_MAP), 'headers-unreachable'];

describe('coverage', () => {
  it('has text for every finding kind the checks can produce', () => {
    expect([...LOCALIZED_FINDING_KINDS].sort()).toEqual([...ALL_FINDING_KINDS].sort());
  });

  it('has a non-empty title, impact and fix in all three languages', () => {
    for (const kind of ALL_FINDING_KINDS) {
      for (const language of LANGUAGES) {
        const text = findingText(kind, language);
        expect(text, `${kind} / ${language}`).not.toBeNull();
        expect(text!.title.length, `${kind} / ${language} title`).toBeGreaterThan(5);
        expect(text!.impact.length, `${kind} / ${language} impact`).toBeGreaterThan(20);
        expect(text!.fix.length, `${kind} / ${language} fix`).toBeGreaterThan(20);
      }
    }
  });

  it('gives a different wording per language (nothing left untranslated)', () => {
    for (const kind of ALL_FINDING_KINDS) {
      const ar = findingText(kind, 'ar')!;
      const fr = findingText(kind, 'fr')!;
      const en = findingText(kind, 'en')!;
      expect(new Set([ar.title, fr.title, en.title]).size, `${kind} titles`).toBe(3);
      expect(new Set([ar.impact, fr.impact, en.impact]).size, `${kind} impacts`).toBe(3);
    }
  });

  it('writes Arabic text in Arabic script', () => {
    for (const kind of ALL_FINDING_KINDS) {
      const ar = findingText(kind, 'ar')!;
      // Arabic text must contain Arabic letters; a few Latin technical terms
      // (HTTPS, SameSite) are expected and fine.
      expect(/[؀-ۿ]/.test(ar.title), `${kind} title`).toBe(true);
      expect(/[؀-ۿ]/.test(ar.impact), `${kind} impact`).toBe(true);
      expect(/[؀-ۿ]/.test(ar.fix), `${kind} fix`).toBe(true);
    }
  });

  it('leaves no unreplaced {name} placeholder anywhere', () => {
    const ids = [
      ...Object.keys(GROUNDING_MAP).filter((k) => !k.startsWith('cookie-')),
      'headers-unreachable',
      'cookie-JSESSIONID-no-httponly',
      'cookie-JSESSIONID-no-secure',
      'cookie-JSESSIONID-no-samesite',
    ];
    for (const id of ids) {
      for (const language of LANGUAGES) {
        const text = findingText(id, language)!;
        for (const field of ['title', 'impact', 'fix'] as const) {
          expect(text[field], `${id} / ${language} / ${field}`).not.toContain('{name}');
        }
      }
    }
  });
});

describe('cookie names', () => {
  it('extracts the cookie name from a finding id', () => {
    expect(cookieNameFromId('cookie-JSESSIONID-no-secure')).toBe('JSESSIONID');
    expect(cookieNameFromId('cookie-_ga-no-samesite')).toBe('_ga');
    // Cookie names may themselves contain hyphens or the flag words.
    expect(cookieNameFromId('cookie-my-session-id-no-httponly')).toBe('my-session-id');
    expect(cookieNameFromId('cookie-secure_token-no-secure')).toBe('secure_token');
  });

  it('returns null for a non-cookie id', () => {
    expect(cookieNameFromId('tls-cert-expired')).toBeNull();
    expect(cookieNameFromId('cookie-weird-suffix')).toBeNull();
  });

  it('puts the real cookie name into the localized title', () => {
    for (const language of LANGUAGES) {
      const title = findingText('cookie-JSESSIONID-no-secure', language)!.title;
      expect(title, language).toContain('JSESSIONID');
    }
  });
});

describe('localizedTitle', () => {
  it('returns the localized title for a known kind', () => {
    expect(localizedTitle('tls-cert-expired', 'ar', 'TLS certificate has expired')).toContain(
      'شهادة',
    );
    expect(localizedTitle('tls-cert-expired', 'fr', 'TLS certificate has expired')).toContain(
      'certificat',
    );
  });

  it('falls back to the check title for an unknown kind, in every language', () => {
    for (const language of LANGUAGES) {
      expect(localizedTitle('some-future-check', language, 'Some future check')).toBe(
        'Some future check',
      );
    }
  });
});
