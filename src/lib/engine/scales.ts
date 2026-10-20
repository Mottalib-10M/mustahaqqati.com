/** Barèmes : fonctionnaires (15 مراتب) et enseignants (4 رتب × مستويات × درجات). */
import { P, type RankId, type Band } from './params';
export const GRADES = Array.from({ length: 15 }, (_, i) => i + 1);
export const RANKS: RankId[] = ['musaid', 'mumaris', 'mutaqaddim', 'khabir'];
const clampInt = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(x)));

export const gradeDef = (g: number) => P.general.grades[String(clampInt(g, 1, 15))];
export const gradeSteps = (g: number) => gradeDef(g).steps;
/** Salaire de base d'une مرتبة et d'une درجة (échelon borné au dernier de la مرتبة). */
export function generalBasic(grade: number, step: number): number {
  const d = gradeDef(grade);
  return d.first + d.inc * (clampInt(step, 1, d.steps) - 1);
}
export const generalRow = (g: number) => Array.from({ length: gradeSteps(g) }, (_, i) => generalBasic(g, i + 1));

export const rankLevels = (r: RankId) => P.teachers.ranks[r].levels.length;
export const levelDef = (r: RankId, level: number) => P.teachers.ranks[r].levels[clampInt(level, 1, rankLevels(r)) - 1];
export function teacherBasic(rank: RankId, level: number, step: number): number {
  const d = levelDef(rank, level);
  return d.first + d.inc * (clampInt(step, 1, d.steps) - 1);
}
export const teacherRow = (r: RankId, level: number) => Array.from({ length: levelDef(r, level).steps }, (_, i) => teacherBasic(r, level, i + 1));

const band = (bands: Band[], g: number) => bands.find((b) => g >= b.from && g <= b.to)?.amount ?? null;
/** بدل الانتقال الشهري (art. 36) : null pour la 15e مرتبة, absente du texte. */
export const transportFor = (grade: number) => band(P.transport, grade);
/** بدل الانتداب اليومي داخل المملكة (art. 6). */
export const missionFor = (grade: number) => band(P.mission, grade);

/** Échéancier : la علاوة passe au 1er محرم (art. 17 du نظام الخدمة المدنية). Renvoie, pour chaque année
 *  hégirienne à partir de `fromYear`, l'échelon et le salaire, jusqu'au dernier échelon. */
export function timeline(basicAt: (step: number) => number, steps: number, step: number, fromYear: number) {
  const rows: Array<{ year: number; step: number; basic: number }> = [];
  for (let s = clampInt(step, 1, steps), y = fromYear; s <= steps; s++, y++) rows.push({ year: y, step: s, basic: basicAt(s) });
  return rows;
}
/** مرتبة du سلم العام équivalente à un rang et un niveau d'enseignant (لائحة الوظائف التعليمية, art. 30) :
 *  elle fixe بدل النقل et les autres indemnités de l'enseignant. */
export const teacherEquivGrade = (r: RankId, level: number) => P.teachers.equiv[r][clampInt(level, 1, rankLevels(r)) - 1];
