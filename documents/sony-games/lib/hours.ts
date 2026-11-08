import { HOURS } from "./store";

export type OpenStatus = {
  open: boolean;
  label: string;
  detail: string;
};

const ALGIERS_OFFSET_MS = 60 * 60 * 1000;

// Algeria is UTC+1 all year (no daylight saving time since 1981), so a fixed
// offset is exact and avoids depending on the browser's time zone data.
export function algiersClock(date: Date): { day: number; minutes: number } {
  const local = new Date(date.getTime() + ALGIERS_OFFSET_MS);
  return {
    day: local.getUTCDay(),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

export function hoursFor(day: number) {
  return day === 5 ? HOURS.friday : HOURS.regular;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function getOpenStatus(date: Date): OpenStatus {
  const { day, minutes } = algiersClock(date);
  const today = hoursFor(day);
  const opens = toMinutes(today.open);
  const closes = toMinutes(today.close);

  if (minutes >= opens && minutes < closes) {
    return { open: true, label: "Ouvert", detail: `ferme à ${today.close}` };
  }
  if (minutes < opens) {
    return {
      open: false,
      label: "Fermé",
      detail: `ouvre aujourd'hui à ${today.open}`,
    };
  }
  const tomorrow = hoursFor((day + 1) % 7);
  return {
    open: false,
    label: "Fermé",
    detail: `ouvre demain à ${tomorrow.open}`,
  };
}
