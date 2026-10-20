/** Aides de page sans dépendance aux routes (une page ne peut importer helpers.ts : cycle guides → page → routes). */
import type { Helpers } from './helpers';
import type { RankId } from './engine/params';
/** Tableau « par niveau » d'un rang d'enseignant : premier et dernier salaire, net avec le بدل النقل de la
 *  مرتبة équivalente (art. 30 de لائحة الوظائف التعليمية), régime civil. */
export function teacherLevels(h: Helpers, rank: RankId, caption: string) {
  const L = h.P.teachers.ranks[rank].levels;
  return h.table(['المستوى', 'المرتبة المقابلة', 'أول درجة', 'آخر درجة', 'عدد الدرجات', 'بدل النقل', 'الصافي في أول درجة'], L.map((l, i) => {
    const g = h.SC.teacherEquivGrade(rank, i + 1); const tr = h.SC.transportFor(g) ?? 0;
    const net = h.SAL.salary({ basic: l.first, transport: tr, other: 0, regime: 'civil' }).net;
    return [h.num(i + 1), h.ORD[g], h.m(l.first), h.m(l.first + l.inc * (l.steps - 1)), h.num(l.steps), h.m(tr), h.m(net)];
  }), caption);
}
