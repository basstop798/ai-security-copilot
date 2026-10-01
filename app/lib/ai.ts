/**
 * AI provider layer: NVIDIA NIM (primary) -> Gemini (fallback) -> local
 * deterministic advisor (no key needed). The model ONLY writes plain-
 * language `impact` / `fix` copy for findings our code already detected,
 * classified and grounded — it never decides severity or invents a
 * vulnerability (see lib/schema.ts for the strict output contract).
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Finding, ReportLanguage } from './types';
import { parseLlmOutput, assertKnownFindingIds, type LlmReport } from './schema';

const LANGUAGE_NAME: Record<ReportLanguage, string> = {
  ar: 'Arabic',
  fr: 'French',
  en: 'English',
};

/**
 * Neither SDK applies a default timeout, so a provider that accepts the
 * connection and then stalls will hang the whole report indefinitely —
 * observed locally: a Gemini call sat for over a minute with the UI stuck on
 * "Checking..." and nothing in the log. Two layers guard against it:
 *
 *  - AI_CALL_TIMEOUT_MS: per HTTP call, passed to each SDK.
 *  - AI_TOTAL_BUDGET_MS: for the whole provider chain (both providers, their
 *    retries and backoff). When it runs out we stop waiting and return the
 *    local rule-based summary, which needs no network at all.
 *
 * A report that is a few seconds late is a bug; a report that never arrives
 * is a broken product.
 */
const AI_CALL_TIMEOUT_MS = Number(process.env.AI_CALL_TIMEOUT_MS || 12_000);
const AI_TOTAL_BUDGET_MS = Number(process.env.AI_TOTAL_BUDGET_MS || 30_000);

function buildPrompt(findings: Finding[], language: ReportLanguage): string {
  const langName = LANGUAGE_NAME[language];
  const findingsJson = JSON.stringify(
    findings.map((f) => ({ id: f.id, category: f.category, severity: f.severity, title: f.title, detail: f.detail })),
    null,
    2,
  );
  return `You are writing a security report for a small-business owner with NO technical background, in ${langName}.

You will receive a JSON array of security findings already detected and classified by our own code. Your ONLY job is to write, for EACH finding id, in ${langName}:
- "impact": one short plain-language sentence on what could go wrong for their business (no jargon).
- "fix": one short, concrete, actionable sentence on what to do (a non-technical owner could hand this to any web developer).

Rules:
- Output ONLY valid JSON matching this exact shape, nothing else, no markdown fences:
  {"language": "${language}", "findings": [{"id": "...", "impact": "...", "fix": "..."}, ...]}
- Include EVERY finding id from the input, in the same order, exactly once.
- Do NOT invent new findings, do NOT change severity, do NOT add extra keys.
- Do NOT invent CVE numbers or technical claims beyond what "detail" states.
- Write "impact" and "fix" in ${langName} (natural, simple, non-technical wording).

Findings:
${findingsJson}`;
}

async function callNvidia(findings: Finding[], language: ReportLanguage): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY not set');
  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: AI_CALL_TIMEOUT_MS,
    maxRetries: 0, // the provider chain below handles fallback
  });
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: buildPrompt(findings, language) }],
    temperature: 0.3,
    max_tokens: 2048,
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('NVIDIA NIM returned an empty response');
  return text;
}

// Tried in order. A model whose daily free-tier quota is exhausted returns a
// 429 with "quota" in the message — that's a per-(project, model) cap, so a
// different model id gets its own separate quota and is worth trying before
// giving up on Gemini entirely. Overridable for whenever these get retired.
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.7-flash',
  process.env.GEMINI_FALLBACK_MODEL_2 || 'gemini-3.6-flash',
];

async function callGeminiModel(genAI: GoogleGenerativeAI, modelName: string, prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });

  // The hosted free tier returns transient 503/429 under load (verified on
  // hackathon day: intermittent "high demand" errors). Retry twice with a
  // short backoff before giving up on this model.
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt, { timeout: AI_CALL_TIMEOUT_MS });
      const text = result.response.text();
      if (!text) throw new Error('Gemini returned an empty response');
      return text;
    } catch (err) {
      lastError = err as Error;
      const quotaExceeded = /quota/i.test(lastError.message);
      if (quotaExceeded) {
        console.error(`[ai] gemini model "${modelName}" quota exceeded, not retrying this model:`, lastError.message);
        throw lastError; // daily cap — retrying the same model won't help.
      }
      const transient = /503|429|overloaded|high demand/i.test(lastError.message);
      if (!transient || attempt === 2) throw lastError;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('Gemini call failed');
}

async function callGeminiPrompt(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError: Error | undefined;
  for (const modelName of GEMINI_MODELS) {
    try {
      return await callGeminiModel(genAI, modelName, prompt);
    } catch (err) {
      lastError = err as Error;
      console.error(`[ai] gemini model "${modelName}" failed:`, lastError.message);
    }
  }
  throw lastError ?? new Error('Gemini call failed');
}

async function callGemini(findings: Finding[], language: ReportLanguage): Promise<string> {
  return callGeminiPrompt(buildPrompt(findings, language));
}

/** Strip a ```json ... ``` fence if the model added one despite instructions. */
function stripFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

/** Deterministic, key-free fallback: templated copy, honestly not AI-authored. */
function localAdvisor(findings: Finding[], language: ReportLanguage): LlmReport {
  const templates: Record<ReportLanguage, (f: Finding) => { impact: string; fix: string }> = {
    en: (f) => ({
      impact: `This may expose your business to risk: ${f.title.toLowerCase()}.`,
      fix: `Ask your web developer to address: ${f.title.toLowerCase()}.`,
    }),
    fr: (f) => ({
      impact: `Cela peut exposer votre entreprise à un risque : ${f.title.toLowerCase()}.`,
      fix: `Demandez à votre développeur web de corriger : ${f.title.toLowerCase()}.`,
    }),
    ar: (f) => ({
      impact: `قد يعرّض هذا نشاطك التجاري للخطر: ${f.title}.`,
      fix: `اطلب من مطوّر موقعك معالجة: ${f.title}.`,
    }),
  };
  const templater = templates[language];
  return {
    language,
    findings: findings.map((f) => ({ id: f.id, ...templater(f) })),
  };
}

export type AiResult = {
  report: LlmReport;
  provider: 'nvidia' | 'gemini' | 'local';
};

/**
 * Try NVIDIA -> Gemini -> local, in order. Each remote provider gets ONE
 * repair retry if its JSON fails validation (re-prompt with the error).
 * Never throws: the local advisor always succeeds, so callers always get
 * a full report — this is what keeps the live demo unbreakable.
 */
export async function writeReport(findings: Finding[], language: ReportLanguage): Promise<AiResult> {
  // Hard deadline for the whole chain: whatever the providers do, the caller
  // gets a complete report. The local advisor is synchronous and needs no
  // network, so this race can only ever end in a usable report.
  const budget = new Promise<AiResult>((resolve) => {
    setTimeout(() => {
      console.error(
        `[ai] total AI budget of ${AI_TOTAL_BUDGET_MS}ms exhausted — returning the local template advisor`,
      );
      resolve({ report: localAdvisor(findings, language), provider: 'local' });
    }, AI_TOTAL_BUDGET_MS).unref?.();
  });

  return Promise.race([writeReportFromProviders(findings, language), budget]);
}

async function writeReportFromProviders(
  findings: Finding[],
  language: ReportLanguage,
): Promise<AiResult> {
  const knownIds = findings.map((f) => f.id);

  const attempts: { name: 'nvidia' | 'gemini'; call: (p: string) => Promise<string> }[] = [
    { name: 'nvidia', call: () => callNvidia(findings, language) },
    { name: 'gemini', call: () => callGemini(findings, language) },
  ];

  for (const attempt of attempts) {
    try {
      const raw = await attempt.call('');
      const parsed = parseLlmOutput(stripFence(raw));
      if (parsed.success) {
        assertKnownFindingIds(parsed.data, knownIds);
        return { report: parsed.data, provider: attempt.name };
      }
      console.error(`[ai] ${attempt.name} returned invalid JSON, attempting one repair retry:`, parsed.error);
      // one repair retry, feeding the validation error back
      const repairPrompt = `${buildPrompt(findings, language)}\n\nYour previous response was invalid: ${parsed.error}\nReturn ONLY the corrected JSON, no explanation.`;
      const raw2 =
        attempt.name === 'nvidia'
          ? await callNvidiaRaw(repairPrompt)
          : await callGeminiRaw(repairPrompt);
      const parsed2 = parseLlmOutput(stripFence(raw2));
      if (parsed2.success) {
        assertKnownFindingIds(parsed2.data, knownIds);
        return { report: parsed2.data, provider: attempt.name };
      }
      console.error(`[ai] ${attempt.name} repair retry also returned invalid JSON, moving to next provider:`, parsed2.error);
    } catch (err) {
      console.error(`[ai] ${attempt.name} provider failed, moving to next provider:`, (err as Error).message);
    }
  }

  console.error('[ai] all providers failed or are unconfigured — falling back to the local template advisor');
  return { report: localAdvisor(findings, language), provider: 'local' };
}

async function callNvidiaRaw(prompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY not set');
  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: AI_CALL_TIMEOUT_MS,
    maxRetries: 0,
  });
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 2048,
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('NVIDIA NIM returned an empty response');
  return text;
}

async function callGeminiRaw(prompt: string): Promise<string> {
  return callGeminiPrompt(prompt);
}
