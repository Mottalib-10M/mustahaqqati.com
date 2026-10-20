/** Mini-outil : échéancier des علاوات d'une مرتبة à partir de l'échelon actuel, au 1er محرم de chaque année. */
import { useState } from 'react';
import SelectField from '../ui/SelectField';
import { P } from '../../lib/engine/params';
import { GRADES, gradeDef, generalBasic, timeline } from '../../lib/engine/scales';
import { formatMoney, hijriYear } from '../../lib/format';
const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة'];
const m = (n: number) => formatMoney(Math.round(n));
export default function MiniTimeline({ grade: g0 = 6, step: s0 = 3, idPrefix = 'mt', fullHref }: { grade?: number; step?: number; idPrefix?: string; fullHref: string }) {
  const [grade, setGrade] = useState(g0); const [step, setStep] = useState(s0);
  const d = gradeDef(grade); const st = Math.min(step, d.steps);
  const plan = timeline((s) => generalBasic(grade, s), d.steps, st, hijriYear(P.today));
  const top = plan[plan.length - 1];
  return (
    <div data-simulateur-secondaire className="rounded-lg border border-navy-200 bg-navy-50 p-4">
      <form className="grid gap-x-4 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <SelectField id={`${idPrefix}-g`} label="المرتبة" value={String(grade)} onChange={(v) => setGrade(Number(v))} options={GRADES.map((g) => ({ value: String(g), label: `المرتبة ${ORD[g]}` }))} />
        <SelectField id={`${idPrefix}-s`} label="درجتك الحالية" value={String(st)} onChange={(v) => setStep(Number(v))} options={Array.from({ length: d.steps }, (_, i) => ({ value: String(i + 1), label: `الدرجة ${i + 1}` }))} />
      </form>
      <p className="mt-3 text-lg font-semibold text-navy-900" data-resultat>{plan.length > 1 ? `${plan.length - 1} علاوة متبقية، آخرها في محرم ${top.year}هـ: ${m(top.basic)}` : 'أنت في آخر درجة: لا علاوة إلا بالترقية'}</p>
      <p className="mt-1 text-sm text-navy-700">كل علاوة {m(d.inc)} تُضاف في 1 محرم من كل عام.</p>
      <p className="mt-1 text-sm"><a href={fullHref} className="text-accent-700 underline">حاسبة الراتب الصافي</a></p>
    </div>
  );
}
