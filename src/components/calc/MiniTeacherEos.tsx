/** Mini-outil : مكافأة نهاية الخدمة d'un enseignant selon le rang et les années complètes (لائحة الوظائف التعليمية, art. 29). */
import { useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { teacherEos } from '../../lib/engine/teacher-eos';
import { P, type RankId } from '../../lib/engine/params';
import { formatMoney, formatNumber } from '../../lib/format';
const m = (n: number) => formatMoney(Math.round(n));
const RANKS: RankId[] = ['musaid', 'mumaris', 'mutaqaddim', 'khabir'];
export default function MiniTeacherEos({ rank: r0 = 'mumaris', years: y0 = 25, idPrefix = 'mt', fullHref }: { rank?: string; years?: number; idPrefix?: string; fullHref: string }) {
  const [rank, setRank] = useState<RankId>((RANKS as string[]).includes(r0) ? (r0 as RankId) : 'mumaris');
  const [years, setYears] = useState(y0);
  const r = teacherEos(rank, years);
  return (
    <div data-simulateur-secondaire className="rounded-lg border border-navy-200 bg-navy-50 p-4">
      <form className="grid gap-x-4 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <SelectField id={`${idPrefix}-r`} label="الرتبة عند انتهاء الخدمة" value={rank} onChange={(v) => setRank(v as RankId)} options={RANKS.map((k) => ({ value: k, label: P.teachers.names[k] }))} />
        <NumberField id={`${idPrefix}-y`} label="سنوات الخدمة في الوظائف التعليمية" value={years} onChange={setYears} unit="سنة" max={60} />
      </form>
      {r.amount !== null
        ? <p className="mt-3 text-lg font-semibold text-navy-900" data-resultat>المكافأة: {m(r.amount)} <span className="text-sm font-normal text-navy-700">({formatNumber(r.years, 0)} سنة كاملة × {m(r.perYear!)} عن كل سنة)</span></p>
        : <p className="mt-3 text-lg font-semibold text-navy-900" data-resultat>لا مكافأة قبل {formatNumber(P.teachers.eos.minYears, 0)} سنوات <span className="text-sm font-normal text-navy-700">(إلا عند الوفاة أو العجز الصحي، ولا يحدد الجدول مبلغها)</span></p>}
      <p className="mt-1 text-sm"><a href={fullHref} className="text-accent-700 underline">سلم رواتب المعلمين كاملاً</a></p>
    </div>
  );
}
