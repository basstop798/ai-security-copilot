import { PS_PLUS_PLANS, type Months, type PsPlusPlan } from "./store";

// How much the multi-month offer saves against paying month by month.
export function savings(plan: PsPlusPlan, months: Months): number | null {
  const monthly = plan.prices[1];
  const price = plan.prices[months];
  if (months === 1 || monthly == null || price == null) return null;
  const saved = monthly * months - price;
  return saved > 0 ? saved : null;
}

export function perMonth(plan: PsPlusPlan, months: Months): number | null {
  const price = plan.prices[months];
  if (months === 1 || price == null) return null;
  return Math.round(price / months);
}

// The cheapest thing you can buy, for "dès 2 400 DA".
export function lowestPrice(plans: PsPlusPlan[] = PS_PLUS_PLANS): number | null {
  const all = plans.flatMap((p) =>
    Object.values(p.prices).filter((v): v is number => v != null),
  );
  return all.length ? Math.min(...all) : null;
}
