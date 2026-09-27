/**
 * Small, single-purpose UI primitives for the report page. Written fresh
 * for this project — no code copied from any other repo (see CLAUDE.md
 * "Fair play"). Colour convention (red=critical -> amber=medium -> blue=low)
 * is a standard security-severity palette, not any one project's design.
 */

import type { ReactNode } from 'react';
import type { Severity } from '@/lib/types';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const CARD = 'rounded-xl border border-white/10 bg-zinc-900 shadow-lg shadow-black/20';

export const SEVERITY_STYLES: Record<Severity, { chip: string; dot: string; text: string; label: Record<'ar' | 'fr' | 'en', string> }> = {
  critical: {
    chip: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
    dot: 'bg-rose-500',
    text: 'text-rose-400',
    label: { ar: 'حرج', fr: 'Critique', en: 'Critical' },
  },
  high: {
    chip: 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
    dot: 'bg-orange-400',
    text: 'text-orange-400',
    label: { ar: 'عالي', fr: 'Élevé', en: 'High' },
  },
  medium: {
    chip: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    label: { ar: 'متوسط', fr: 'Moyen', en: 'Medium' },
  },
  low: {
    chip: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
    dot: 'bg-sky-400',
    text: 'text-sky-400',
    label: { ar: 'منخفض', fr: 'Faible', en: 'Low' },
  },
  info: {
    chip: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/25',
    dot: 'bg-zinc-500',
    text: 'text-zinc-300',
    label: { ar: 'معلومة', fr: 'Info', en: 'Info' },
  },
};

export function SeverityBadge({ severity, language }: { severity: Severity; language: 'ar' | 'fr' | 'en' }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset',
        s.chip,
      )}
    >
      <span className={cx('size-1.5 rounded-full', s.dot)} />
      {s.label[language]}
    </span>
  );
}

export function RiskGauge({ score, label }: { score: number; label: string }) {
  const tone =
    score >= 70
      ? { text: 'text-rose-400', ring: '#fb7185' }
      : score >= 40
        ? { text: 'text-amber-400', ring: '#fbbf24' }
        : { text: 'text-emerald-400', ring: '#34d399' };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className={cx(CARD, 'flex items-center gap-5 p-5')}>
      <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 -rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={tone.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(90 48 48)"
          className={cx('fill-current text-2xl font-bold tabular-nums', tone.text)}
        >
          {clamped}
        </text>
      </svg>
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        <div className="text-xs text-zinc-500">0 = safe · 100 = severe</div>
      </div>
    </div>
  );
}

const CHECK_STEPS = ['tls', 'headers', 'email', 'cookies'] as const;

const CHECK_STEP_LABELS: Record<(typeof CHECK_STEPS)[number], Record<'ar' | 'fr' | 'en', string>> = {
  tls: { ar: 'الشهادة الأمنية (HTTPS)', fr: 'Certificat HTTPS', en: 'HTTPS certificate' },
  headers: { ar: 'رؤوس الأمان', fr: "En-têtes de sécurité", en: 'Security headers' },
  email: { ar: 'حماية البريد (SPF/DMARC)', fr: 'Protection email (SPF/DMARC)', en: 'Email auth (SPF/DMARC)' },
  cookies: { ar: 'إعدادات الكوكيز', fr: 'Paramètres des cookies', en: 'Cookie settings' },
};

/** Live-looking checklist shown while the 4 passive checks run server-side. */
export function CheckingProgress({ language }: { language: 'ar' | 'fr' | 'en' }) {
  return (
    <div className={cx(CARD, 'space-y-3 p-5')}>
      {CHECK_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-3 text-sm text-zinc-300">
          <span
            className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"
            style={{ animationDelay: `${i * 120}ms` }}
          />
          {CHECK_STEP_LABELS[step][language]}
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section className={CARD}>
      {title && (
        <header className="border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h3>
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Spinner() {
  return (
    <span
      role="img"
      aria-label="loading"
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"
    />
  );
}
