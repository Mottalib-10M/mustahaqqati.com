/** Estimation du soutien حساب المواطن. Aucun barème chiffré n'est publié : ces règles reproduisent, à 1 riyal
 *  près, les réponses de la حاسبة تقديرية officielle relevées le 2026-10-20 (`P.ca.checks`, testées). La
 *  décision appartient au programme. */
import { P } from './params';
export interface CaIn { adults: number; children: number; income: number }
export interface CaOut { weight: number; full: number; taper: number; stop: number; reduction: number; support: number; capped: boolean }
export function caWeight(adults: number, children: number) {
  return 1 + P.ca.adultW * Math.max(0, Math.round(adults)) + P.ca.childW * Math.max(0, Math.round(children));
}
export function ca(i: CaIn): CaOut {
  const w = caWeight(i.adults, i.children);
  const capped = w >= P.ca.capW;
  const full = P.ca.base * Math.min(w, P.ca.capW);
  const taper = Math.round(P.ca.taper * Math.min(w, P.ca.capW));
  const stop = capped ? P.ca.stopCap : Math.floor(P.ca.stop * w);
  const income = Math.max(0, i.income);
  const reduction = P.ca.slope * Math.max(0, income - taper);
  let support = Math.min(full, P.ca.base * w - reduction);
  if (income >= stop) support = 0;
  else support = Math.max(P.ca.floor, support);
  return { weight: w, full, taper, stop, reduction, support: Math.round(support), capped };
}
