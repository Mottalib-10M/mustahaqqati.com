/** مكافأة نهاية الخدمة des enseignants (لائحة الوظائف التعليمية, art. 29) : un montant par année complète de service,
 *  fixé par le tableau selon le total des années et le rang ; rien sous 10 ans, sauf décès ou invalidité (al. 6),
 *  cas que le tableau ne chiffre pas sous 10 ans. Seules les années complètes comptent (« عن كل سنة كاملة »). */
import { P, type RankId } from './params';
export interface TeacherEosOut { years: number; eligible: boolean; bracket: number | null; perYear: number | null; amount: number | null }
/** Indice de la tranche du tableau pour un total d'années complètes, ou null sous la première tranche. */
export function bracketOf(years: number): number | null {
  const b = P.teachers.eos.brackets; let k: number | null = null;
  for (let i = 0; i < b.length; i++) if (years >= b[i]) k = i;
  return k;
}
export function teacherEos(rank: RankId, serviceYears: number): TeacherEosOut {
  const years = Math.max(0, Math.floor(serviceYears));
  const k = bracketOf(years);
  const eligible = years >= P.teachers.eos.minYears && k !== null;
  const perYear = k === null ? null : P.teachers.eos.perYear[rank][k];
  return { years, eligible, bracket: k, perYear, amount: eligible && perYear !== null ? perYear * years : null };
}
