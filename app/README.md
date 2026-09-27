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
3. Every finding is matched against a local knowledge base (35 entries, sourced from
   NIST/OWASP/MITRE/RFC) — this is what decides severity, never the AI. The AI only writes the
   plain-language explanation, translation and fix instructions.
4. You get a risk score (0-100), a category breakdown, and a Today / This week / This month
   action plan.

## Why the AI can't invent problems

Severity comes from deterministic code (`lib/checks.ts`) and a keyword-matched knowledge base
(`lib/grounding.ts` + `lib/cve-kb.json`) that can only ever **raise** a finding's severity to
match a cited real-world source — never lower it, never invent one from nothing. The AI model
(`lib/ai.ts`) receives already-classified findings and only produces human-readable text; its
JSON output is schema-validated (Zod) with one repair retry on failure.

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

- 83 automated tests (Vitest): SSRF guard, grounding/severity logic, risk scoring, schema
  validation.
- Verified against 10+ real domains (including companies with public bug-bounty programs) —
  risk scores vary meaningfully (12-100), not a fixed number.
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

Passive checks only (four categories), no continuous monitoring yet, no NVIDIA NIM live today
(see above). Next step: scheduled re-checks with alerts, more African languages, and enabling
NVIDIA NIM once its key becomes available.
