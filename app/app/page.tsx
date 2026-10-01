'use client';

import { useState } from 'react';
import {
  CARD,
  CategorySummary,
  CheckingProgress,
  NotCheckedPanel,
  Panel,
  RiskGauge,
  SeverityBadge,
  cx,
} from './components/ui';
import { DEMO_DOMAIN } from '@/lib/demo-data';
import type { CopilotReport, ReportLanguage } from '@/lib/types';

const UI_TEXT: Record<ReportLanguage, Record<string, string>> = {
  ar: {
    title: 'مساعد الأمن الذكي',
    subtitle: 'اكتب اسم موقعك، واحصل على تقرير أمني بسيط وخطة عمل واضحة.',
    domainLabel: 'اسم الموقع (مثال: example.com)',
    consent: 'أؤكد أن هذا الموقع ملكي أو أن لدي إذن بفحصه.',
    checkButton: 'افحص الموقع',
    checking: 'جارٍ الفحص...',
    tryDemo: 'أو جرّب موقع اختبار عام',
    riskScore: 'درجة الخطر',
    today: '🔴 اليوم',
    thisWeek: '🟠 هذا الأسبوع',
    thisMonth: '🟡 هذا الشهر',
    findings: 'التفاصيل',
    source: 'المصدر',
    poweredBy: 'مصدر الذكاء الاصطناعي',
    demoNotice: 'هذه نتيجة محفوظة (الفحص المباشر فشل أو الهدف موقع اختبار).',
    reviewNotice: 'راجع هذه الحلول مع مطوّر موقعك قبل التنفيذ.',
    printButton: 'اطبع / احفظ كـ PDF',
  },
  fr: {
    title: 'Copilote de sécurité IA',
    subtitle: "Entrez votre domaine et obtenez un rapport de sécurité clair avec un plan d'action.",
    domainLabel: 'Nom de domaine (ex. example.com)',
    consent: 'Je confirme être propriétaire de ce site ou avoir la permission de le vérifier.',
    checkButton: 'Vérifier le site',
    checking: 'Vérification en cours...',
    tryDemo: 'Ou essayez un site de test public',
    riskScore: 'Score de risque',
    today: "🔴 Aujourd'hui",
    thisWeek: '🟠 Cette semaine',
    thisMonth: '🟡 Ce mois-ci',
    findings: 'Détails',
    source: 'Source',
    poweredBy: 'Fournisseur IA',
    demoNotice: 'Résultat enregistré (la vérification en direct a échoué ou la cible est un site de test).',
    reviewNotice: 'Vérifiez ces corrections avec votre développeur avant de les appliquer.',
    printButton: 'Imprimer / Enregistrer en PDF',
  },
  en: {
    title: 'AI Security Co-pilot',
    subtitle: 'Type your website domain and get a plain-language security report with an action plan.',
    domainLabel: 'Domain (e.g. example.com)',
    consent: 'I confirm I own this website or have permission to check it.',
    checkButton: 'Check website',
    checking: 'Checking...',
    tryDemo: 'Or try a public test site',
    riskScore: 'Risk score',
    today: '🔴 Today',
    thisWeek: '🟠 This week',
    thisMonth: '🟡 This month',
    findings: 'Details',
    source: 'Source',
    poweredBy: 'AI provider',
    demoNotice: 'Saved result (the live check failed, or the target is a test site).',
    reviewNotice: 'Review these fixes with your web developer before applying them.',
    printButton: 'Print / Save as PDF',
  },
};

type ApiResponse = { report: CopilotReport; meta: { aiProvider: string; usedDemoFallback: boolean } };

export default function Home() {
  const [domain, setDomain] = useState('');
  const [consent, setConsent] = useState(false);
  const [language, setLanguage] = useState<ReportLanguage>('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [lastCheckedDomain, setLastCheckedDomain] = useState<string | null>(null);

  const t = UI_TEXT[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  async function runCheck(targetDomain: string, targetLanguage: ReportLanguage) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: targetDomain, consent: true, language: targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setResult(data);
        setLastCheckedDomain(targetDomain);
      }
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || !domain.trim()) return;
    runCheck(domain.trim(), language);
  }

  /**
   * The report's findings/impact/fix text is written once, in one language,
   * by the AI at check time — switching the `language` state alone only
   * re-renders the static UI chrome (buttons, labels), NOT that stored
   * text. So if a report is already showing, re-run the check in the new
   * language instead of leaving stale-language text next to a
   * newly-relabelled UI.
   */
  function onLanguageChange(next: ReportLanguage) {
    setLanguage(next);
    if (lastCheckedDomain && !loading) {
      runCheck(lastCheckedDomain, next);
    }
  }

  return (
    <div dir={dir} className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">{t.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.subtitle}</p>
      </header>

      <div className={cx(CARD, 'p-5 print:hidden')}>
        <div className="mb-4 flex justify-center gap-2">
          {(['ar', 'fr', 'en'] as ReportLanguage[]).map((lng) => (
            <button
              key={lng}
              type="button"
              onClick={() => onLanguageChange(lng)}
              className={cx(
                'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
                language === lng
                  ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40'
                  : 'bg-white/5 text-zinc-400 ring-white/10 hover:bg-white/10',
              )}
            >
              {lng === 'ar' ? 'العربية' : lng === 'fr' ? 'Français' : 'English'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="domain" className="mb-1.5 block text-xs font-medium text-zinc-400">
              {t.domainLabel}
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-lg bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 ring-1 ring-white/10 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              dir="ltr"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-zinc-300 select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="size-4 rounded border-white/20 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
            />
            {t.consent}
          </label>

          <button
            type="submit"
            disabled={loading || !consent || !domain.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? t.checking : t.checkButton}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setDomain(DEMO_DOMAIN);
              setConsent(true);
              runCheck(DEMO_DOMAIN, language);
            }}
            className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-4 hover:text-zinc-300"
          >
            {t.tryDemo} ({DEMO_DOMAIN})
          </button>
        </div>
      </div>

      {loading && (
        <div className="print:hidden">
          <CheckingProgress language={language} />
        </div>
      )}

      {error && (
        <div className="print:hidden rounded-lg bg-rose-500/10 p-4 text-sm text-rose-300 ring-1 ring-rose-500/20 ring-inset">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {result.meta.usedDemoFallback && (
            <p className="rounded-lg bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-300 ring-1 ring-amber-500/20 ring-inset">
              {t.demoNotice}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <RiskGauge score={result.report.riskScore} label={t.riskScore} />
              <div className="text-xs text-zinc-500">
                {t.poweredBy}: <span className="font-mono text-zinc-400">{result.meta.aiProvider}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="print:hidden rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/10 ring-inset transition-colors hover:bg-white/10"
            >
              {t.printButton}
            </button>
          </div>

          <CategorySummary findings={result.report.findings} language={language} />

          <Panel title={t.today}>
            <ActionList items={result.report.actionPlan.today} empty="—" />
          </Panel>
          <Panel title={t.thisWeek}>
            <ActionList items={result.report.actionPlan.thisWeek} empty="—" />
          </Panel>
          <Panel title={t.thisMonth}>
            <ActionList items={result.report.actionPlan.thisMonth} empty="—" />
          </Panel>

          <Panel title={t.findings}>
            <p className="mb-3 text-xs text-zinc-500">{t.reviewNotice}</p>
            <ul className="space-y-3">
              {result.report.findings.map((f) => (
                <li key={f.id} className="rounded-lg border border-white/5 bg-zinc-950/40 p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-100">{f.title}</span>
                    <SeverityBadge severity={f.severity} language={language} />
                  </div>
                  {f.impact && <p className="mb-1.5 text-sm text-zinc-300">{f.impact}</p>}
                  {f.fix && <p className="mb-1.5 text-sm text-emerald-300">{f.fix}</p>}
                  <a
                    href={f.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs text-zinc-500 underline decoration-zinc-600 underline-offset-4 hover:text-zinc-300"
                  >
                    {t.source} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Panel>

          <NotCheckedPanel language={language} />
        </div>
      )}
    </div>
  );
}

function ActionList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-zinc-500">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-zinc-200">
          <span className="text-zinc-500">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
