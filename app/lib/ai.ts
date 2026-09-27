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

  const client = new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1' });
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

async function callGemini(findings: Finding[], language: ReportLanguage): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(buildPrompt(findings, language));
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
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
    } catch {
      // fall through to the next provider
    }
  }

  return { report: localAdvisor(findings, language), provider: 'local' };
}

async function callNvidiaRaw(prompt: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY not set');
  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
  const client = new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1' });
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}
