"use client";

import { useState } from "react";
import { formatDA } from "@/lib/format";
import { perMonth, savings } from "@/lib/psplus";
import { DURATIONS, PS_PLUS_PLANS, type Months, type PsPlusPlan } from "@/lib/store";
import { MESSAGES, waLink } from "@/lib/whatsapp";
import { CheckIcon, WhatsAppIcon } from "./icons";
import { ButtonLink, SectionHeading } from "./ui";

const TONES: Record<PsPlusPlan["tone"], { bar: string; card: string; check: string; button: "primary" | "blue" | "ghost" }> = {
  slate: {
    bar: "from-[#7d8bb5] to-[#4b5a86]",
    card: "border-white/[0.08]",
    check: "text-[#a9b6dc]",
    button: "ghost",
  },
  blue: {
    bar: "from-ps-bright to-ps",
    card: "border-ps/30",
    check: "text-ps-bright",
    button: "blue",
  },
  red: {
    bar: "from-accent-bright to-accent",
    card: "border-accent/50 shadow-2xl shadow-accent/15",
    check: "text-accent-bright",
    button: "primary",
  },
};

export function PsPlus() {
  const [months, setMonths] = useState<Months>(1);
  const duration = DURATIONS.find((d) => d.months === months)!;

  return (
    <section id="ps-plus" className="relative overflow-hidden border-y border-white/[0.06] bg-navy-900">
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-ps/15 blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionHeading eyebrow="Abonnements" title="Abonnements PS Plus" align="center">
          Choisissez votre formule et votre durée, puis commandez directement
          sur WhatsApp.
        </SectionHeading>

        <fieldset className="mx-auto mt-10 flex w-fit rounded-full border border-white/10 bg-navy-950/70 p-1">
          <legend className="sr-only">Durée de l&apos;abonnement</legend>
          {DURATIONS.map((d) => (
            <label
              key={d.months}
              className="relative cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition has-checked:bg-ps has-checked:text-white has-checked:shadow-lg has-checked:shadow-ps/30 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ps-bright sm:px-7"
            >
              <input
                type="radio"
                name="duree-ps-plus"
                value={d.months}
                checked={months === d.months}
                onChange={() => setMonths(d.months)}
                className="sr-only"
              />
              {d.label}
            </label>
          ))}
        </fieldset>

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {PS_PLUS_PLANS.map((plan) => (
            <li key={plan.id}>
              <PlanCard plan={plan} months={months} durationLabel={duration.label} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-muted">
          Tarifs indicatifs, susceptibles de changer. Confirmez le prix et la
          disponibilité sur WhatsApp avant de payer.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan, months, durationLabel }: { plan: PsPlusPlan; months: Months; durationLabel: string }) {
  const tone = TONES[plan.tone];
  const price = plan.prices[months];
  const saved = savings(plan, months);
  const monthly = perMonth(plan, months);

  return (
    <article className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-navy-850 p-6 transition sm:p-7 ${tone.card}`}>
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${tone.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">PS Plus</p>
          <h3 className="mt-1 font-display text-2xl font-bold text-ink">{plan.name}</h3>
        </div>
        {plan.badge ? (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-[#ffb3b8] ring-1 ring-accent/40">
            {plan.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">{plan.pitch}</p>

      <div className="mt-6 min-h-[5.5rem]" aria-live="polite">
        {price != null ? (
          <>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold tracking-tight text-ink tabular-nums">
                {formatDA(price)}
              </span>
              <span className="text-sm text-muted">/ {durationLabel}</span>
            </p>
            <p className="mt-2 text-sm">
              {saved != null ? (
                <>
                  <span className="font-semibold text-wa">Économisez {formatDA(saved)}</span>
                  {monthly != null ? <span className="text-muted"> · soit {formatDA(monthly)} / mois</span> : null}
                </>
              ) : (
                <span className="text-muted">Sans engagement</span>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-bold text-ink">Prix sur demande</p>
            <p className="mt-2 text-sm text-muted">Tarif {durationLabel} à confirmer sur WhatsApp</p>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-3 border-t border-white/[0.07] pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm text-ink/90">
            <CheckIcon size={18} strokeWidth={2.25} className={`mt-0.5 shrink-0 ${tone.check}`} />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <ButtonLink
          href={waLink(MESSAGES.psPlus(plan.name, durationLabel, price))}
          external
          variant={tone.button}
          className="w-full"
          aria-label={`Commander PS Plus ${plan.name} ${durationLabel} sur WhatsApp`}
        >
          <WhatsAppIcon size={18} />
          Commander sur WhatsApp
        </ButtonLink>
      </div>
    </article>
  );
}
