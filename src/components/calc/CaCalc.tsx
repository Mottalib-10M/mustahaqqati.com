/** Estimation حساب المواطن : personnes à charge × revenu mensuel du foyer → soutien estimé et seuils. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Ledger from './Ledger';
import Actions from './Actions';
import { P } from '../../lib/engine/params';
import { ca } from '../../lib/engine/ca';
import { formatMoney, displayDate } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';

const m = (n: number) => formatMoney(Math.round(n));
const opts = (n: number) => Array.from({ length: n + 1 }, (_, i) => ({ value: String(i), label: i === n ? `${i} أو أكثر` : String(i) }));
interface Props { adults?: number; children?: number; income?: number; methodHref: string; idPrefix?: string }

export default function CaCalc({ adults: a0 = 1, children: c0 = 2, income: i0 = 7000, methodHref, idPrefix = 'c' }: Props) {
  const [adults, setAdults] = useState(a0);
  const [children, setChildren] = useState(c0);
  const [income, setIncome] = useState(i0);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setAdults(num(u, 'a', a0)); setChildren(num(u, 'c', c0)); setIncome(num(u, 'i', i0));
  }, []);
  useEffect(() => { updateURL({ a: adults, c: children, i: income }); }, [adults, children, income]);
  const r = ca({ adults, children, income });
  const id = (k: string) => `${idPrefix}-${k}`;
  const state = income >= r.stop ? 'الدخل بلغ الحد المانع: لا دعم' : income > r.taper ? 'الدخل فوق حد الإعفاء من التناقص: الدعم ينقص' : 'الدخل تحت حد الإعفاء: الدعم كامل';
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <NumberField id={id('income')} label="دخل الأسرة الشهري" value={income} onChange={setIncome} unit="ريال" max={200000} help="مجموع دخل أفراد الأسرة المقيمين معاً، شاملاً البدلات وقبل حسم التأمينات" className="sm:col-span-2" />
          <SelectField id={id('adults')} label="تابعون بالغون (18 فأكثر)" value={String(Math.min(adults, 6))} onChange={(v) => setAdults(Number(v))} options={opts(6)} help="دون رب الأسرة" />
          <SelectField id={id('children')} label="تابعون دون 18 سنة" value={String(Math.min(children, 6))} onChange={(v) => setChildren(Number(v))} options={opts(6)} />
        </form>
        <Ledger label="الدعم الشهري التقديري" value={m(r.support)} sub={state}
          rows={[['الدعم الكامل لهذه الأسرة', m(r.full)], ['حد الإعفاء من التناقص', m(r.taper)], ['الحد المانع', m(r.stop)], ['النقص بسبب الدخل', `− ${m(Math.max(0, r.full - Math.max(r.support, 0)))}`]]}
          notes={[`مبني على ما تعيده الحاسبة التقديرية الرسمية في ${displayDate(P.ca.observed, 'ar-SA')}؛ القرار للبرنامج. الدعم الإضافي ممدد حتى ${displayDate(P.ca.extraUntil, 'ar-SA')}.`]} />
      </div>
      <Actions methodHref={methodHref} note="لا يُطلب رقم هوية ولا دخول إلى أي حساب." />
    </div>
  );
}
