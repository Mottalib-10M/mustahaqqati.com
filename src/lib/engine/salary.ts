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
/** `housing` : بدل السكن النقدي mensuel. Assiette du nouveau régime = salaire de base + بدل السكن النقدي,
 *  plafonnée à 45 000 (اللائحة التنفيذية لنظام التأمينات الاجتماعية, art. 17 a-b, أم القرى du 29/12/1445 ;
 *  نظام التأمينات الاجتماعية, art. 8 §2). Le logement en nature (art. 17 c) n'est pas chiffré ici : le texte
 *  l'évalue « بما يساوي الأجر أو الراتب الأساس عن شهرين » sans dire sur quelle période. Régime civil :
 *  salaire de base seul (نظام التقاعد المدني, art. 14). */
export interface SalaryIn { basic: number; transport: number; other: number; housing?: number; regime: Regime; date?: string }
export interface SalaryOut { basic: number; transport: number; other: number; housing: number; gross: number; base: number; rate: number; pension: number; net: number }
export function salary(i: SalaryIn): SalaryOut {
  const housing = Math.max(0, i.housing ?? 0);
  const rate = i.regime === 'civil' ? P.pension.civil.employee : newLawRate(i.date ?? P.today) / 2;
  const base = i.regime === 'civil' ? i.basic : Math.min(i.basic + housing, P.pension.newLaw.ceiling);
  const pension = base * rate;
  const gross = i.basic + housing + i.transport + i.other;
  return { basic: i.basic, transport: i.transport, other: i.other, housing, gross, base, rate, pension, net: gross - pension };
}
