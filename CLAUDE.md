# Hackathon workspace — read this first (Claude Code + Hermes)

## Who you are working with
- Solo participant, GOMYCODE × NVIDIA "Come Build with AI" hackathon, **Sunday 27 Sep 2026**.
- Talk to the user in **Arabic** (English technical terms inline are fine).
- The user knows TypeScript/Next.js and reads code, but relies on the assistant to write it.
  Explain simply, one step at a time. Call out risks honestly and early.

## Fair play
This project is written **fresh on 27 Sep**. Do NOT open or copy code from
`C:\Users\abdel\Documents\recon-dashboard` (the user's older recon project). Ideas are fine;
code is not. Only the prepared DATA in `prep/` (public CVE/CWE/RFC facts) and the plan are
reused, and this is declared on the project card.

## The project: AI Security Co-pilot (domain check)
Pitch: *a security check for small businesses and non-technical owners in Africa. Type your
website's domain, press one button, and get a plain-language report in Arabic, French or
English — an action plan (Today / This week / This month) with cited, human-reviewed fixes.*

- **User:** the small-business owner / beginner with no security team. No tools to install.
- **Differentiators:** one-field UX, passive-only checks, grounded citations (no invented
  CVEs), report language ar/fr/en, action plan by urgency, provider fallback.

## Passive checks only (4 modules — no more)
Everything a normal browser visit would do. **No port scanning, no Nmap, no brute force.**
1. **HTTPS / certificate** — does https work, does http redirect to https, certificate issuer
   and days until expiry (Node `tls.connect`, read `getPeerCertificate()`).
2. **Security headers** — one GET of the homepage: HSTS, CSP, X-Frame-Options,
   X-Content-Type-Options, Referrer-Policy.
3. **Email spoofing** — DNS TXT: SPF (`v=spf1`, check `-all`/`~all`/`+all`) and DMARC
   (`_dmarc.<domain>`, check `p=`). Use `node:dns/promises`.
4. **Cookies** — `Set-Cookie` flags from the same GET: Secure, HttpOnly, SameSite.

## Safety gates (must exist before any network call)
- **Consent checkbox** (required): "I own this website or have permission to check it."
  The API rejects requests without `consent: true`.
- **Demo targets:** the user owns no domain. Demo only on public, intentionally-vulnerable
  test sites listed in `prep/demo-targets.md` (main: `demo.testfire.net`). Add one-click
  "Try a test site" buttons for them in the UI. Save a cached result per target for offline demo.
- **Domain validation:** a public registrable hostname only (no IPs, no `localhost`, no ports,
  no paths — strip `https://` and paths).
- **SSRF guard:** resolve the domain; reject if ANY address is loopback, private (RFC1918),
  link-local, CGNAT or cloud metadata (169.254.169.254). Use `redirect: 'manual'` and re-check
  every redirect hop (max 3). Timeouts on every fetch (~8 s). Cap response body size.
- Simple in-memory rate limit (e.g. 5 checks / minute per IP).

## Pipeline (build in this order — smallest working slice first)
1. Domain + consent → `/api/check` → run the 4 checks (plain code) → findings list. (Sprint 1)
2. Ground each finding against `prep/cve-kb.json` by keyword match — the model never invents
   CVEs. Grounding must never downgrade severity.
3. LLM writes plain-language impact + fix steps in the chosen language (ar / fr / en).
   Arabic output renders right-to-left (`dir="rtl"`). The model receives finding types, not
   raw headers/cookie values.
4. Zod-validate model JSON; on failure re-ask once with the error (repair retry).
5. Provider fallback: NVIDIA NIM → Gemini → deterministic local advisor (no key needed;
   may stay in English — say so honestly).
6. Action plan: Today (critical/high) / This week (medium) / This month (low/info) — plain code.
7. **Demo safety:** a saved result for the demo domain, served when the live check fails.
8. UI polish: risk score 0–100, severity colours, "review with your web developer before
   changing anything" warning, citation links, "Print / Save as PDF" (`window.print()`).

Do NOT add features beyond this list — scope is the main risk.

## Stack
- Next.js (App Router) + TypeScript + Tailwind via `create-next-app` in `./app`
  sub-folder or the repo root. Read `node_modules/next/dist/docs/` for the installed version
  before writing framework code. Route handlers that use `dns`/`tls` run on the Node runtime.
- `zod`, `openai` (for NVIDIA NIM's OpenAI-compatible API), `@google/generative-ai`, Vitest.
- NVIDIA NIM: base URL `https://integrate.api.nvidia.com/v1`, key in `NVIDIA_API_KEY`,
  model id copied from build.nvidia.com (e.g. a Llama / Nemotron instruct model).
- Gemini key in `GEMINI_API_KEY`.

## Rules
- **DNS on this PC:** Node's system resolver is `127.0.0.1` and refuses connections, so
  `dns.resolveTxt()` fails. Use `new dns.Resolver()` + `setServers(['1.1.1.1','8.8.8.8'])`
  for the SPF/DMARC check (configurable via `DNS_SERVERS` env). Verified 26 Sep.
- Keys only in `.env.local` (gitignored). Never commit, print or paste keys.
- Commit after every working step.
- Tests (validation, SSRF guard, SPF/DMARC parsing, grounding, schema) + lint + build must
  pass before calling anything done.
- Submission closes **17:30 Tunis time** (not 20:00). Stop coding by ~16:15.

See `PLAN.md` for the schedule, demo script and project card; `QA.md` for judge questions.
