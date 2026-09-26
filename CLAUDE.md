# Hackathon workspace — read this first (Claude Code + Hermes)

## Who you are working with
- Solo participant, GOMYCODE × NVIDIA "Come Build with AI" hackathon, **Sunday 27 Sep 2026**.
- Talk to the user in **Arabic** (English technical terms inline are fine).
- The user knows TypeScript/Next.js and reads code, but relies on the assistant to write it.
  Explain simply, one step at a time. Call out risks honestly and early.

## Fair play
This project is written **fresh on 27 Sep**. Do NOT copy code from
`C:\Users\abdel\Documents\recon-dashboard` (the user's older project). Only the prepared DATA
in `prep/` (public CVE/CWE facts, a fictional sample scan) and the plan are reused, and this is
declared on the project card.

## The project: AI Security Co-pilot
Pitch: *an AI security co-pilot for small businesses and startups in Africa that can't afford
a security team. Paste a raw scan (e.g. Nmap output) → get a ranked, plain-language report
with cited, human-reviewed fixes.*

Pipeline (build in this order — smallest working slice first):
1. Paste raw scan → `/api/analyze` → LLM → report rendered as cards. (Sprint 1)
2. Parse findings (port / service / version) from the log with plain code.
3. Ground each finding against `prep/cve-kb.json` by keyword match — the model never invents CVEs.
   Grounding must never downgrade severity.
4. Redact IPs / emails / secrets before anything is sent to a model; show the count in the UI.
5. Zod-validate model JSON; on failure re-ask once with the error (repair retry).
6. Provider fallback: NVIDIA NIM → Gemini → Claude → deterministic local advisor (no key needed).
7. UI polish: risk score 0–100, severity colours, "review before running" warning, citation links.

## Stack
- Next.js (App Router) + TypeScript + Tailwind, created with `create-next-app` in `./app-src`
  or `./copilot`. Read `node_modules/next/dist/docs/` for the installed version first.
- `zod`, `openai` (for NVIDIA NIM's OpenAI-compatible API), `@google/generative-ai`,
  `@anthropic-ai/sdk`, Vitest.
- NVIDIA NIM: base URL `https://integrate.api.nvidia.com/v1`, key in `NVIDIA_API_KEY`,
  model id copied from build.nvidia.com (e.g. a Llama / Nemotron instruct model).

## Rules
- Keys only in `.env.local` (gitignored). Never commit, print or paste keys.
- Commit after every working step.
- Tests + lint + build must pass before calling anything done.
- Submission closes **17:30 Tunis time** (not 20:00). Stop coding by ~16:15.

See `PLAN.md` for the schedule, demo script and project card.
