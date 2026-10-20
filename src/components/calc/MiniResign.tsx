/** Mini-outil : part de la مكافأة en cas de démission selon l'ancienneté (art. 85). */
import { useState } from 'react';
import NumberField from '../ui/NumberField';
import { eos, resignShare } from '../../lib/engine/eos';
import { formatMoney, formatNumber } from '../../lib/format';
const m = (n: number) => formatMoney(Math.round(n));
export default function MiniResign({ wage: w0 = 9000, years: y0 = 7, idPrefix = 'mr', fullHref }: { wage?: number; years?: number; idPrefix?: string; fullHref: string }) {
  const [wage, setWage] = useState(w0); const [years, setYears] = useState(y0);
  const r = eos({ wage, years, reason: 'resign' }); const s = resignShare(years);
  return (
    <div data-simulateur-secondaire className="rounded-lg border border-navy-200 bg-navy-50 p-4">
      <form className="grid gap-x-4 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <NumberField id={`${idPrefix}-w`} label="الأجر الأخير" value={wage} onChange={setWage} unit="ريال" max={500000} />
        <NumberField id={`${idPrefix}-y`} label="سنوات الخدمة" value={years} onChange={setYears} unit="سنة" max={60} />
      </form>
      <p className="mt-3 text-lg font-semibold text-navy-900" data-resultat>عند الاستقالة: {m(r.amount)} <span className="text-sm font-normal text-navy-700">({s === 0 ? 'لا شيء' : s === 1 ? 'كاملة' : s < 0.5 ? 'الثلث' : 'الثلثان'} من {m(r.full)} عن {formatNumber(years, 1)} سنة)</span></p>
      <p className="mt-1 text-sm"><a href={fullHref} className="text-accent-700 underline">الحاسبة الكاملة بكل الأسباب</a></p>
    </div>
  );
}
