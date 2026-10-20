/** Du salaire de base au net d'un fonctionnaire ou d'un enseignant : base + بدل النقل + autres indemnités
 *  − cotisation retraite. Régime civil (نظام التقاعد المدني, 9 % du salaire de base) pour qui cotisait
 *  avant le 3/7/2024 ; nouveau نظام التأمينات الاجتماعية (part salariale = moitié du taux du moment) pour
 *  un premier emploi après cette date. */
import { P } from './params';

/** Taux total de la branche retraite du nouveau régime à une date (décret م/273, ثالثاً/1). */
export function newLawRate(dateIso: string): number {
  const start = new Date(`${P.pension.newLaw.from}T00:00:00Z`), d = new Date(`${dateIso}T00:00:00Z`);
  // Chaque hausse vaut « من الشهر التالي لانقضاء » l'année écoulée : la première année finit le 2/7/2025,
  // le 19 % s'applique dès le 1/8/2025. Mois calendaires écoulés depuis le mois d'entrée en vigueur.
  const months = (d.getUTCFullYear() - start.getUTCFullYear()) * 12 + (d.getUTCMonth() - start.getUTCMonth());
  let rate = P.pension.newLaw.rates[0].total;
  for (const r of P.pension.newLaw.rates) if (r.afterMonths === 0 || months >= r.afterMonths + 1) rate = r.total;
  return rate;
}

export type Regime = 'civil' | 'new';
export interface SalaryIn { basic: number; transport: number; other: number; regime: Regime; date?: string }
export interface SalaryOut { basic: number; transport: number; other: number; gross: number; rate: number; pension: number; net: number }
export function salary(i: SalaryIn): SalaryOut {
  const rate = i.regime === 'civil' ? P.pension.civil.employee : newLawRate(i.date ?? P.today) / 2;
  const base = i.regime === 'civil' ? i.basic : Math.min(i.basic, P.pension.newLaw.ceiling);
  const pension = base * rate;
  const gross = i.basic + i.transport + i.other;
  return { basic: i.basic, transport: i.transport, other: i.other, gross, rate, pension, net: gross - pension };
}
