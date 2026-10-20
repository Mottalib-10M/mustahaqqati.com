/** Mini-outil : plancher de pension du nouveau régime selon les mois cotisés (art. 17/2). */
import { useState } from 'react';
import NumberField from '../ui/NumberField';
import { P } from '../../lib/engine/params';
import { newLawFloor } from '../../lib/engine/pension';
import { formatMoney, formatNumber } from '../../lib/format';
export default function MiniFloor({ years: y0 = 25, idPrefix = 'mf', fullHref }: { years?: number; idPrefix?: string; fullHref: string }) {
  const [years, setYears] = useState(y0);
  const f = newLawFloor(Math.round(years * 12));
  return (
    <div data-simulateur-secondaire className="rounded-lg border border-navy-200 bg-navy-50 p-4">
      <form className="grid gap-x-4 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <NumberField id={`${idPrefix}-y`} label="سنوات الاشتراك" value={years} onChange={setYears} unit="سنة" max={60} />
      </form>
      <p className="mt-3 text-lg font-semibold text-navy-900" data-resultat>{f ? `الحد الأدنى للمعاش: ${formatMoney(Math.round(f))}` : `لا معاش قبل ${formatNumber(P.pension.newLaw.minMonths)} شهر اشتراك`}</p>
      <p className="mt-1 text-sm"><a href={fullHref} className="text-accent-700 underline">حاسبة المعاش الكاملة</a></p>
    </div>
  );
}
