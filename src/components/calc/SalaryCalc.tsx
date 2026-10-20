/**
 * Calculateur de salaire : fonctionnaire (مرتبة × درجة) ou enseignant (رتبة × مستوى × درجة) → salaire de base,
 * بدل النقل de la مرتبة (équivalente pour l'enseignant), retenue retraite, net ; puis l'échéancier des
 * علاوات au 1er محرم jusqu'au dernier échelon. Hydratation (RECETTE §17.5) : premier rendu = valeurs de la
 * page ; les paramètres du lien ne sont lus qu'après, dans un effet.
 */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import Ledger from './Ledger';
import Actions from './Actions';
import { P, type RankId } from '../../lib/engine/params';
import { GRADES, RANKS, gradeDef, generalBasic, levelDef, rankLevels, teacherBasic, teacherEquivGrade, transportFor, timeline } from '../../lib/engine/scales';
import { salary, newLawRate, type Regime } from '../../lib/engine/salary';
import { formatMoney, formatPercent, hijriYear } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة'];
const m = (n: number) => formatMoney(Math.round(n));
type Mode = 'general' | 'teacher';
interface Props { mode?: Mode; grade?: number; step?: number; rank?: RankId; level?: number; regime?: Regime; methodHref: string; idPrefix?: string }
const isRank = (r: string): r is RankId => (RANKS as string[]).includes(r);

export default function SalaryCalc({ mode: mo0 = 'general', grade: g0 = 8, step: s0 = 1, rank: r0 = 'mumaris', level: l0 = 1, regime: re0 = 'civil', methodHref, idPrefix = 'r' }: Props) {
  const [mode, setMode] = useState<Mode>(mo0);
  const [grade, setGrade] = useState(g0);
  const [rank, setRank] = useState<RankId>(r0);
  const [level, setLevel] = useState(l0);
  const [step, setStep] = useState(s0);
  const [regime, setRegime] = useState<Regime>(re0);
  const [other, setOther] = useState(0);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setMode(str(u, 'm', mo0) === 'teacher' ? 'teacher' : 'general');
    setGrade(Math.min(15, Math.max(1, num(u, 'g', g0)))); const r = str(u, 'r', r0); if (isRank(r)) setRank(r);
    setLevel(num(u, 'l', l0)); setStep(num(u, 's', s0)); setRegime(str(u, 'p', re0) === 'new' ? 'new' : 'civil'); setOther(num(u, 'o', 0));
  }, []);
  useEffect(() => { updateURL({ m: mode, g: mode === 'general' ? grade : undefined, r: mode === 'teacher' ? rank : undefined, l: mode === 'teacher' ? level : undefined, s: step, p: regime, o: other || undefined }); }, [mode, grade, rank, level, step, regime, other]);

  const lv = Math.min(level, rankLevels(rank));
  const steps = mode === 'general' ? gradeDef(grade).steps : levelDef(rank, lv).steps;
  const st = Math.min(Math.max(1, step), steps);
  const basicAt = (s: number) => (mode === 'general' ? generalBasic(grade, s) : teacherBasic(rank, lv, s));
  const eqGrade = mode === 'general' ? grade : teacherEquivGrade(rank, lv);
  const tr = transportFor(eqGrade);
  const r = salary({ basic: basicAt(st), transport: tr ?? 0, other, regime, date: P.today });
  const inc = mode === 'general' ? gradeDef(grade).inc : levelDef(rank, lv).inc;
  const year = hijriYear(P.today);
  const plan = timeline(basicAt, steps, st, year);
  const top = plan[plan.length - 1];
  const rateLabel = regime === 'civil' ? `حسم التقاعد المدني ${formatPercent(r.rate, 0)}` : `حصة المشترك ${formatPercent(r.rate, 0)} (من ${formatPercent(newLawRate(P.today), 0)})`;
  const id = (k: string) => `${idPrefix}-${k}`;
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <Toggle id={id('mode')} label="السلم" value={mode} onChange={(v) => setMode(v as Mode)} options={[{ value: 'general', label: 'الموظفون' }, { value: 'teacher', label: 'المعلمون' }]} />
          {mode === 'general'
            ? <SelectField id={id('grade')} label="المرتبة" value={String(grade)} onChange={(v) => setGrade(Number(v))} options={GRADES.map((g) => ({ value: String(g), label: `المرتبة ${ORD[g]}` }))} />
            : <SelectField id={id('rank')} label="الرتبة التعليمية" value={rank} onChange={(v) => { if (isRank(v)) setRank(v); }} options={RANKS.map((k) => ({ value: k, label: P.teachers.names[k] }))} />}
          {mode === 'teacher' && <SelectField id={id('level')} label="المستوى" value={String(lv)} onChange={(v) => setLevel(Number(v))} options={Array.from({ length: rankLevels(rank) }, (_, i) => ({ value: String(i + 1), label: `المستوى ${i + 1}` }))} />}
          <SelectField id={id('step')} label="الدرجة" value={String(st)} onChange={(v) => setStep(Number(v))} options={Array.from({ length: steps }, (_, i) => ({ value: String(i + 1), label: `الدرجة ${i + 1}: ${m(basicAt(i + 1))}` }))} />
          <SelectField id={id('regime')} label="نظام التقاعد" value={regime} onChange={(v) => setRegime(v === 'new' ? 'new' : 'civil')} options={[{ value: 'civil', label: 'التقاعد المدني (قبل 3 يوليو 2024)' }, { value: 'new', label: 'نظام التأمينات الجديد (أول وظيفة بعده)' }]} />
          <NumberField id={id('other')} label="بدلات أخرى شهرياً" value={other} onChange={setOther} unit="ريال" max={100000} help="بدل طبيعة عمل أو منطقة نائية أو غيره، كما في مسير راتبك" />
        </form>
        <Ledger label="الراتب الصافي التقديري في الشهر" value={m(r.net)}
          sub={mode === 'teacher' ? `${P.teachers.names[rank]}، المستوى ${lv}، الدرجة ${st} (تعادل المرتبة ${ORD[eqGrade]} في البدلات)` : `المرتبة ${ORD[grade]}، الدرجة ${st}`}
          rows={[['الراتب الأساسي', m(r.basic)], ['بدل النقل', tr == null ? 'غير محدد في اللائحة' : m(r.transport)], ...(other ? [['بدلات أخرى', m(other)] as [string, string]] : []), ['الإجمالي', m(r.gross)], [rateLabel, `− ${m(r.pension)}`]]}
          total={['الصافي', m(r.net)]}
          notes={[st < steps ? `العلاوة السنوية ${m(inc)} في 1 محرم ${year + 1}هـ، وآخر درجة (${steps}) في ${top.year}هـ براتب أساسي ${m(top.basic)}.` : `هذه آخر درجة في ${mode === 'general' ? 'المرتبة' : 'المستوى'}: لا علاوة بعدها إلا بالترقية.`]} />
      </div>
      <Actions methodHref={methodHref} note="الحساب في متصفحك، ولا يُرسل شيء." />
    </div>
  );
}
