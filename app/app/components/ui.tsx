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

const GAUGE_SCALE: Record<'ar' | 'fr' | 'en', string> = {
  ar: '0 = آمن · 100 = خطر شديد',
  fr: '0 = sûr · 100 = grave',
  en: '0 = safe · 100 = severe',
};

export function RiskGauge({
  score,
  label,
  language,
}: {
  score: number;
  label: string;
  language: 'ar' | 'fr' | 'en';
}) {
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
        <div className="text-xs text-zinc-500">{GAUGE_SCALE[language]}</div>
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

/**
 * Scope disclosure. Four passive checks cannot tell anyone their site is
 * safe, so the report must say plainly what it did not look at — otherwise a
 * low risk score reads as "my site is fine", which is the most harmful thing
 * a security tool can imply.
 */
const NOT_CHECKED: Record<'ar' | 'fr' | 'en', { title: string; intro: string; items: string[] }> = {
  ar: {
    title: 'ما لم نفحصه',
    intro:
      'هذا فحص سطحي من الخارج، يغطي أربعة أمور فقط. الدرجة المنخفضة لا تعني أن موقعك آمن تماماً. لم نفحص:',
    items: [
      'الثغرات داخل كود الموقع (مثل SQL injection أو XSS)',
      'قوة كلمات المرور أو أمان لوحة التحكم',
      'الفيروسات أو الملفات الضارة على الموقع',
      'إصدارات برامج السيرفر أو المنافذ المفتوحة',
      'النسخ الاحتياطية وأمان الاستضافة نفسها',
    ],
  },
  fr: {
    title: "Ce que nous n'avons pas vérifié",
    intro:
      "Cette vérification est passive, vue de l'extérieur, et ne couvre que quatre domaines. Un score faible ne signifie pas que votre site est sûr. Nous n'avons pas vérifié :",
    items: [
      'Les failles dans le code du site (injection SQL, XSS)',
      "La solidité des mots de passe ou la sécurité de l'espace d'administration",
      'Les virus ou fichiers malveillants présents sur le site',
      'Les versions des logiciels du serveur ou les ports ouverts',
      "Les sauvegardes et la sécurité de l'hébergement lui-même",
    ],
  },
  en: {
    title: 'What we did NOT check',
    intro:
      'This is a passive check from the outside and covers four areas only. A low score does not mean your site is safe. We did not check:',
    items: [
      'Weaknesses inside your website code (SQL injection, XSS)',
      'Password strength or admin-panel security',
      'Viruses or malicious files on the site',
      'Server software versions or open ports',
      'Backups and the security of the hosting itself',
    ],
  },
};

export function NotCheckedPanel({ language }: { language: 'ar' | 'fr' | 'en' }) {
  const t = NOT_CHECKED[language];
  return (
    <Panel title={t.title}>
      <p className="mb-3 text-xs text-zinc-500">{t.intro}</p>
      <ul className="space-y-1.5">
        {t.items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">✕</span>
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const CATEGORY_LABELS: Record<'tls' | 'headers' | 'email' | 'cookies', Record<'ar' | 'fr' | 'en', string>> = {
  tls: { ar: 'الشهادة والتشفير', fr: 'Certificat & chiffrement', en: 'Certificate & encryption' },
  headers: { ar: 'رؤوس الأمان', fr: 'En-têtes de sécurité', en: 'Security headers' },
  email: { ar: 'حماية البريد', fr: 'Protection email', en: 'Email protection' },
  cookies: { ar: 'الكوكيز', fr: 'Cookies', en: 'Cookies' },
};

const CATEGORY_ORDER = ['tls', 'headers', 'email', 'cookies'] as const;

/**
 * 4-category summary strip: shows, at a glance, which of the 4 passive
 * checks found something and how bad the worst finding in each was.
 * Purely derived from the findings array already in the report — no new
 * backend data needed.
 */
export function CategorySummary({
  findings,
  language,
}: {
  findings: { category: 'tls' | 'headers' | 'email' | 'cookies'; severity: Severity }[];
  language: 'ar' | 'fr' | 'en';
}) {
  const SEVERITY_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORY_ORDER.map((cat) => {
        const matches = findings.filter((f) => f.category === cat);
        const worst = matches.reduce<Severity | null>((acc, f) => {
          if (!acc || SEVERITY_RANK[f.severity] > SEVERITY_RANK[acc]) return f.severity;
          return acc;
        }, null);
        const clean = matches.length === 0;
        const style = worst ? SEVERITY_STYLES[worst] : null;

        return (
          <div
            key={cat}
            className={cx(
              CARD,
              'flex flex-col items-center gap-1.5 px-3 py-3 text-center',
              clean && 'ring-1 ring-emerald-500/20',
            )}
          >
            <span className={cx('text-lg', clean ? 'text-emerald-400' : style?.text)}>
              {clean ? '✓' : matches.length}
            </span>
            <span className="text-[11px] leading-tight text-zinc-400">{CATEGORY_LABELS[cat][language]}</span>
          </div>
        );
      })}
    </div>
  );
}
