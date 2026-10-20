/** مكافأة نهاية الخدمة, نظام العمل art. 84, 85 et 87. Assiette : le dernier salaire effectif (الأجر الفعلي,
 *  art. 2 : salaire de base et indemnités prévues) ; une commission peut en être exclue par accord (art. 86). */
import { P } from './params';
export type Reason = 'employer' | 'resign' | 'force' | 'woman';
export interface EosIn { wage: number; years: number; months?: number; days?: number; reason: Reason }
export interface EosOut { serviceYears: number; full: number; firstPart: number; secondPart: number; share: number; amount: number }
/** Durée de service en années décimales (mois de 30 jours, art. 2 : « الشهر: ثلاثون يوماً »). */
export const serviceYears = (y: number, m = 0, d = 0) => Math.max(0, y) + Math.max(0, m) / 12 + Math.max(0, d) / (12 * P.eos.monthDays);
/** Art. 85 : rien sous 2 ans ; un tiers de 2 à 5 ans inclus ; deux tiers au-delà de 5 ans et sous 10 ; tout dès 10 ans. */
export function resignShare(years: number): number {
  const [none, third, twoThirds] = P.eos.resignation;
  if (years < none.to) return none.share;
  if (years <= third.to) return third.share;
  if (years < twoThirds.to) return twoThirds.share;
  return 1;
}
export function eos(i: EosIn): EosOut {
  const n = serviceYears(i.years, i.months, i.days);
  const k = P.eos.halfMonthYears;
  const firstPart = Math.min(n, k) * i.wage / 2;
  const secondPart = Math.max(0, n - k) * i.wage;
  const full = firstPart + secondPart;
  const share = i.reason === 'resign' ? resignShare(n) : 1;
  return { serviceYears: n, full, firstPart, secondPart, share, amount: full * share };
}
