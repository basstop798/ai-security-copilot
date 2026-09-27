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

export function RiskGauge({ score }: { score: number }) {
  const tone = score >= 70 ? 'text-rose-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';
  return (
    <div className={cx(CARD, 'flex items-center gap-5 p-5')}>
      <div className={cx('text-4xl font-bold tabular-nums', tone)}>{score}</div>
      <div className="text-sm text-zinc-400">/ 100</div>
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
