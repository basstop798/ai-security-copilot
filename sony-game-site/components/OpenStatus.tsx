"use client";

import { algiersClock, getOpenStatus } from "@/lib/hours";
import { HOURS_TABLE } from "@/lib/store";
import { useMinute } from "@/lib/useMinute";

// "Ouvert · ferme à 23:30". Renders a neutral placeholder in the static HTML
// and fills in once the browser knows the time.
export function OpenStatus({ className = "" }: { className?: string }) {
  const minute = useMinute();
  const status = minute == null ? null : getOpenStatus(new Date(minute * 60_000));

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm ${className}`}
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${
          status == null
            ? "bg-muted/60"
            : status.open
              ? "bg-wa shadow-[0_0_0_4px_rgba(37,211,102,0.18)]"
              : "bg-accent-bright"
        }`}
      />
      {status == null ? (
        <span className="text-muted">Ouvert tous les jours</span>
      ) : (
        <span>
          <span className="font-semibold text-ink">{status.label}</span>
          <span className="text-muted"> · {status.detail}</span>
        </span>
      )}
    </span>
  );
}

export function HoursTable() {
  const minute = useMinute();
  const today = minute == null ? null : algiersClock(new Date(minute * 60_000)).day;

  return (
    <dl className="divide-y divide-white/5">
      {HOURS_TABLE.map((row) => {
        const isToday = today != null && row.dayNumbers.includes(today);
        return (
          <div
            key={row.days}
            className={`flex items-center justify-between gap-4 py-2.5 ${isToday ? "text-ink" : "text-muted"}`}
          >
            <dt className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="whitespace-nowrap">{row.days}</span>
              {isToday ? (
                <span className="rounded-full bg-ps/20 px-2 py-0.5 text-[0.7rem] font-semibold text-ps-bright">
                  Aujourd&apos;hui
                </span>
              ) : null}
            </dt>
            <dd className="font-display font-semibold whitespace-nowrap tabular-nums">
              {row.open} – {row.close}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
