# AI Security Co-pilot

A plain-language website security check for small-business owners and non-technical users.
Type a domain, confirm consent, get a prioritized security report — in Arabic, French or
English — in seconds.

**Live app:** https://app-sigma-nine-87.vercel.app
**Built for:** GOMYCODE × NVIDIA "Come Build with AI" Hackathon, 27 September 2026

## The problem

Small-business owners across Africa have websites but no security team and no way to check if
their site is safe. Security scanners are built for engineers, in English, with jargon nobody
outside the field understands.

## What it does

1. Type a domain, tick the consent checkbox, pick a language.
2. The app runs four **passive** checks (no active attacks): TLS/certificate validity,
   security headers, SPF/DMARC email-spoofing protection, and cookie flags.
3. Every finding is given a citation from a local knowledge base (11 entries, sourced from
   MITRE CWE / OWASP / RFC) — one entry per finding type, mapped explicitly. The AI only
   writes the plain-language explanation, translation and fix instructions.
4. You get a risk score (0-100), a category breakdown, a Today / This week / This month
   action plan, and an explicit **"what we did NOT check"** list.

## Where severity comes from

Severity is decided by the deterministic check that made the observation (`lib/checks.ts`) and
by nothing else. The knowledge base (`lib/grounding.ts` + `lib/cve-kb.json`) only attaches a
citation, so grounding can never inflate a score.

Each finding type names exactly one knowledge-base entry. There is deliberately no keyword or
substring matching: a finding's detail text contains live values (certificate day counts,
cookie names, SPF records) that collide with keywords. An earlier version of this project did
match on keywords, and the result was a real bug — a certificate with 21 days left read
`"expires in 21 day(s)"`, matched a knowledge-base entry keyed on port `21`, and was reported
to the user as *the vsftpd 2.3.4 backdoor, severity CRITICAL*. Day counts of 23 and 25 hit
Telnet and an Exim RCE the same way. `lib/grounding.test.ts` now locks every day count from 0
to 60 to `medium` with the correct citation.

One check deliberately produces **no** citation and `info` severity: "could not check the
security headers". Failing to measure a site is not a weakness in that site, so it must not add
risk points — it previously scored `high` (25 points) against any site that was merely offline.

The AI model (`lib/ai.ts`) receives already-classified findings and only produces
human-readable text; its JSON output is schema-validated (Zod) with one repair retry on
failure, and finding ids it did not receive are rejected.

## AI provider fallback

NVIDIA NIM integration is implemented (OpenAI-compatible client) but disabled today: NVIDIA's
own account-verification system was down platform-wide on event day (confirmed on NVIDIA's
developer forum — not specific to this team). The working chain today is:

**NVIDIA NIM (ready, currently skipped) → Google Gemini (with retry-on-503/429 backoff) →
local rule-based summary → pre-captured offline demo.**

The app cannot crash from an AI outage — verified by running the full pipeline with zero API
keys configured.

## Security guardrails

- **SSRF protection**: hostnames are resolved and checked against private/reserved IP ranges
  (including full IPv6 `fe80::/10`) before any request; every redirect hop (up to 3) is
  re-checked before being followed.
- **Passive only**: no port scanning, no exploitation attempts — everything a normal browser
  visit already does.
- **Mandatory consent checkbox** before any scan runs.
- **Rate limiting** per IP on the API route.

## Tested

- 93 automated tests (Vitest): SSRF guard, grounding/citation mapping, risk scoring, schema
  validation. Includes a regression test for the certificate-expiry mis-citation described
  above, and integrity tests that fail if a new check ships without a citation or if the
  knowledge base grows an entry no finding can reach.
- Verified against 10+ real domains (including companies with public bug-bounty programs) —
  risk scores vary meaningfully (12-100), not a fixed number. Latest run: github.com 12,
  neverssl.com 37, example.com 72, demo.testfire.net 100, and `expired.badssl.com` correctly
  reported as a critical expired certificate citing CWE-295.
- `tsc --noEmit`, `next build`, and `eslint` all clean.

## Stack

Next.js 16 (App Router, TypeScript) · Zod · Vitest · Google Gemini API · deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # add your own GEMINI_API_KEY
npm run dev
```

## Known limitations

- **Passive checks only**, four categories. The report lists what it did not check, because a
  low score on four checks does not mean a site is safe.
- **No continuous monitoring yet**: every check is one-shot, with no history.
- **The rate limit is per-process** (`lib/rate-limit.ts`, an in-memory `Map`). On Vercel's
  serverless runtime each instance has its own memory, so it does not limit a real distributed
  load — it needs a shared store to be meaningful.
- **The Gemini key is free-tier** and has a daily quota. When it is exhausted the app falls
  back to a local rule-based summary (clearly labelled in the UI as the provider), not to
  silence.
- **Pre-captured demo data** is served only for `demo.testfire.net`, and only when its live
  check fails. Any other domain either gets a live result or an error — canned data is never
  shown as a live result, and the UI labels it when it is used.
- **No NVIDIA NIM live today** (see above).

Next step: scheduled re-checks with alerts, more African languages, and enabling NVIDIA NIM
once its key becomes available.
