/** Retraite : nouveau نظام التأمينات الاجتماعية (م/273, en vigueur le 3/7/2024), ancien régime privé (م/33,
 *  1421 H) et régime civil (م/41, 1393 H). Mensualités en riyals. */
import { P } from './params';
const N = () => P.pension.newLaw;
/** Plancher de pension du nouveau régime (art. 17/2) : 4 000 à 480 mois, réduit en proportion des mois
 *  manquants jusqu'à 2 000 à la durée minimale (lecture linéaire du texte, dite sur la page méthode). */
export function newLawFloor(months: number): number {
  const n = N();
  if (months < n.minMonths) return 0;
  if (months >= n.minPensionFullMonths) return n.minPensionFull;
  const t = (months - n.minMonths) / (n.minPensionFullMonths - n.minMonths);
  return n.minPensionAtMin + t * (n.minPensionFull - n.minPensionAtMin);
}
export interface NewIn { avg: number; months: number; earlyMonths?: number; lateMonths?: number }
export interface NewOut { ratio: number; base: number; cut: number; bonus: number; floor: number; pension: number; eligible: boolean }
/** `earlyMonths` : mois d'avance sur l'âge légal ; `lateMonths` : mois cotisés après cet âge. */
export function newLawPension(i: NewIn): NewOut {
  const n = N();
  const avg = Math.min(Math.max(0, i.avg), n.ceiling);
  const months = Math.max(0, Math.round(i.months));
  const early = Math.max(0, Math.min(n.earlyMaxMonths, Math.round(i.earlyMonths ?? 0)));
  const eligible = early > 0 ? months >= n.earlyMonths : months >= n.minMonths;
  const ratio = Math.min(n.maxRatio, (n.accrual * months) / 12);
  const base = avg * ratio;
  // décote : 3 % par 12 mois d'avance, ou par 12 mois manquants sous 480 — le plus petit des deux
  const cutMonths = early > 0 ? Math.min(early, Math.max(0, n.minPensionFullMonths - months)) : 0;
  const cut = base * n.earlyCutPerYear * (cutMonths / 12);
  const bonus = base * n.lateBonusPerYear * (Math.max(0, i.lateMonths ?? 0) / 12);
  const floor = early > 0 ? 0 : newLawFloor(months);
  const pension = eligible ? Math.max(floor, base - cut + bonus) : 0;
  return { ratio, base, cut, bonus, floor, pension, eligible };
}
/** Âge légal (en mois) d'un assuré qui cotisait déjà au 3/7/2024 avec moins de 240 mois et moins de 50 ans
 *  hégiriens (48 ans et demi grégoriens), selon son âge à cette date (البند خامساً). */
export function transitionAgeMonths(ageAtStartYears: number): number {
  const n = N();
  if (ageAtStartYears < n.transitionAge[0][0]) return n.age * 12;
  let m = n.age * 12;
  for (const [a, mm] of n.transitionAge) if (ageAtStartYears >= a) m = mm;
  return m;
}
export function transitionEarlyMonths(monthsAtStart: number): number {
  const n = N();
  for (const [lo, hi, req] of n.transitionEarly) if (monthsAtStart >= lo && monthsAtStart <= hi) return req;
  return n.earlyMonths;
}
/** Régime civil : dernier salaire de base × années ÷ 40, années plafonnées à 40 (art. 19). */
export function civilPension(lastBasic: number, years: number): number {
  const c = P.pension.civil;
  return (Math.max(0, lastBasic) * Math.min(c.maxYears, Math.max(0, years))) / c.divisor;
}
/** Ancien régime privé : moyenne des 24 derniers mois × années ÷ 40, plafonnée à 100 % (art. 38/3). */
export function privateOldPension(avg24: number, years: number): number {
  const o = P.pension.privateOld;
  return Math.min(avg24, (Math.max(0, avg24) * Math.max(0, years)) / o.divisor);
}
