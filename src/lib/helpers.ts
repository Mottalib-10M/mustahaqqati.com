/** Aides d'écriture de chaque page : liens, montants tirés des barèmes et du moteur, tableaux, sources.
 *  Aucune valeur officielle n'est écrite en dur dans une page : elle passe par ces fonctions. */
import { route, ROUTES } from '../i18n/routes';
import { P, TODAY, type SourceKey, type RankId } from './engine/params';
import * as SC from './engine/scales';
import * as SAL from './engine/salary';
import * as EOS from './engine/eos';
import * as CA from './engine/ca';
import * as PEN from './engine/pension';
import { formatMoney, formatNumber, formatPercent, formatDecimal, displayDate, hijriDate } from './format';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string) {
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm">${caption ? `<caption class="mb-2 text-start text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h) => `<th scope="col" class="px-3 py-2 text-start text-xs font-semibold text-navy-700">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-start text-navy-800">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
/** Nom arabe ordinal d'une مرتبة : « الثامنة ». */
/** Page d'une مرتبة : les quinze مراتب sont regroupées en cinq pages. */
export const bandId = (g: number) => (g <= 3 ? 'maratib-1-3' : g <= 6 ? 'maratib-4-6' : g <= 8 ? 'maratib-7-8' : g <= 10 ? 'maratib-9-10' : 'maratib-11-15');
export const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة'];

export function helpers(strict = false) {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const pc = (x: number, d?: number) => { const v = Math.round(x * 10000) / 100; return formatPercent(x, d ?? (Number.isInteger(v) ? 0 : Number.isInteger(+(v * 10).toFixed(6)) ? 1 : 2)); };
  const date = (iso: string) => displayDate(iso, 'ar-SA');
  const hdate = (iso: string) => hijriDate(iso);
  const num = (n: number, d = 0) => formatNumber(n, d);
  const a = (id: string, text: string) => {
    if (!ROUTES.some((r) => r.id === id)) { if (strict) throw new Error(`Page inconnue dans un lien : ${id}`); return text; }
    return `<a href="${route(id, 'ar')}">${text}</a>`;
  };
  const g = (grade: number, step: number) => SC.generalBasic(grade, step);
  const tch = (rank: RankId, level: number, step: number) => SC.teacherBasic(rank, level, step);
  /** Net mensuel d'un fonctionnaire : base + بدل النقل de sa مرتبة − 9 % (régime civil). */
  const netG = (grade: number, step: number, regime: SAL.Regime = 'civil') => SAL.salary({ basic: g(grade, step), transport: SC.transportFor(grade) ?? 0, other: 0, regime });
  /** Tableau d'une مرتبة : échelon, salaire de base, بدل النقل, retenue retraite, net. */
  const gradeTable = (grade: number, caption?: string) => {
    const tr = SC.transportFor(grade);
    const rows = SC.generalRow(grade).map((b, i) => { const s = netG(grade, i + 1); return [`الدرجة ${i + 1}`, m(b), tr == null ? '–' : m(tr), m(s.pension), m(s.net)]; });
    return table(['الدرجة', 'الراتب الأساسي', 'بدل النقل', 'حسم التقاعد 9٪', 'الصافي التقديري'], rows, caption ?? `المرتبة ${ORD[grade]}: السلم المعتمد بالأمر ${P.general.decree} ابتداءً من ${P.general.from_hijri.split('-').reverse().join('/')}هـ، العلاوة السنوية ${m(SC.gradeDef(grade).inc)}. الصافي محسوب بنظام التقاعد المدني دون بدلات أخرى.`);
  };
  /** Le barème entier des fonctionnaires, échelons en colonnes. */
  const generalFullTable = (caption?: string) => table(['المرتبة', 'أول درجة', 'آخر درجة', 'عدد الدرجات', 'العلاوة السنوية', 'بدل النقل'], SC.GRADES.map((gr) => { const d = SC.gradeDef(gr); return [a(bandId(gr), ORD[gr]), m(d.first), m(d.first + d.inc * (d.steps - 1)), num(d.steps), m(d.inc), SC.transportFor(gr) == null ? '–' : m(SC.transportFor(gr)!)]; }), caption ?? `سلم رواتب الموظفين العام بالريال شهرياً، المعتمد بالأمر ${P.general.decree} وتاريخ ${P.general.from_hijri.split('-').reverse().join('/')}هـ (${date(P.general.from)}).`);
  /** Tableau d'un rang d'enseignant : niveaux en lignes, échelons en colonnes. */
  const rankTable = (rank: RankId, caption?: string) => {
    const L = P.teachers.ranks[rank].levels; const maxSteps = Math.max(...L.map((l) => l.steps));
    return table(['المستوى', ...Array.from({ length: maxSteps }, (_, i) => `الدرجة ${i + 1}`), 'العلاوة'], L.map((l, k) => [`${num(k + 1)}`, ...Array.from({ length: maxSteps }, (_, i) => (i < l.steps ? m(l.first + l.inc * i) : '–')), m(l.inc)]), caption ?? `رتبة ${P.teachers.names[rank]} في سلم رواتب الوظائف التعليمية، بالريال شهرياً، المعمول به منذ ${P.teachers.from_hijri.split('-').reverse().join('/')}هـ.`);
  };
  /** Fin de service pour un salaire et une durée, par motif. */
  const eosRow = (wage: number, years: number) => { const e = EOS.eos({ wage, years, reason: 'employer' }); return [num(years), m(e.full), m(e.full * EOS.resignShare(years))]; };
  return {
    P, TODAY, SC, SAL, EOS, CA, PEN, ORD, bandId,
    a, m, pc, date, hdate, num, dec: (n: number, d = 2) => formatDecimal(n, d),
    table, g, tch, netG, gradeTable, generalFullTable, rankTable, eosRow,
    /** Lien vers une source officielle du fichier de paramètres. */
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.ar}</a>`; },
    /** Encadré. */
    box: (title: string, html: string, kind: 'info' | 'tip' | 'warning' | 'example' = 'info') => `<div class="callout callout-${kind}"><span class="callout-title">${title}</span>${html}</div>`,
  };
}
export type Helpers = ReturnType<typeof helpers>;
