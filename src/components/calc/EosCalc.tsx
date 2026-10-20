/** مكافأة نهاية الخدمة selon le نظام العمل : dernier salaire effectif × durée × motif (art. 84, 85, 87). */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Ledger from './Ledger';
import Actions from './Actions';
import { eos, type Reason } from '../../lib/engine/eos';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

const m = (n: number) => formatMoney(Math.round(n));
const REASONS: Array<{ value: Reason; label: string }> = [
  { value: 'employer', label: 'انتهاء العقد أو إنهاؤه من صاحب العمل' },
  { value: 'resign', label: 'استقالة العامل' },
  { value: 'force', label: 'ترك العمل لقوة قاهرة' },
  { value: 'woman', label: 'العاملة خلال 6 أشهر من الزواج أو 3 من الوضع' },
];
const isReason = (v: string): v is Reason => REASONS.some((r) => r.value === v);
interface Props { basic?: number; allowances?: number; years?: number; months?: number; reason?: Reason; methodHref: string; idPrefix?: string }

export default function EosCalc({ basic: b0 = 8000, allowances: a0 = 2000, years: y0 = 6, months: mo0 = 0, reason: r0 = 'employer', methodHref, idPrefix = 'e' }: Props) {
  const [basic, setBasic] = useState(b0);
  const [allow, setAllow] = useState(a0);
  const [years, setYears] = useState(y0);
  const [months, setMonths] = useState(mo0);
  const [reason, setReason] = useState<Reason>(r0);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setBasic(num(u, 'b', b0)); setAllow(num(u, 'a', a0)); setYears(num(u, 'y', y0)); setMonths(num(u, 'mo', mo0));
    const r = str(u, 'r', r0); if (isReason(r)) setReason(r);
  }, []);
  useEffect(() => { updateURL({ b: basic, a: allow, y: years, mo: months || undefined, r: reason }); }, [basic, allow, years, months, reason]);
  const wage = basic + allow;
  const r = eos({ wage, years, months, reason });
  const id = (k: string) => `${idPrefix}-${k}`;
  const shareLabel = r.share === 1 ? 'المكافأة كاملة' : r.share === 0 ? 'لا شيء (أقل من سنتين)' : r.share < 0.5 ? 'ثلث المكافأة' : 'ثلثا المكافأة';
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <NumberField id={id('basic')} label="آخر راتب أساسي شهري" value={basic} onChange={setBasic} unit="ريال" max={500000} />
          <NumberField id={id('allow')} label="البدلات الثابتة (سكن، نقل…)" value={allow} onChange={setAllow} unit="ريال" max={500000} help="الأجر الفعلي يشمل البدلات المقررة (المادة 2)" />
          <NumberField id={id('years')} label="سنوات الخدمة" value={years} onChange={setYears} unit="سنة" max={60} />
          <NumberField id={id('months')} label="وأشهر" value={months} onChange={setMonths} unit="شهر" max={11} />
          <SelectField id={id('reason')} label="سبب انتهاء العلاقة" value={reason} onChange={(v) => { if (isReason(v)) setReason(v); }} options={REASONS} className="sm:col-span-2" />
        </form>
        <Ledger label="مكافأة نهاية الخدمة التقديرية" value={m(r.amount)}
          sub={`الأجر المعتمد ${m(wage)} عن ${formatNumber(r.serviceYears, 2)} سنة`}
          rows={[[`أول ${formatNumber(Math.min(5, r.serviceYears), 2)} سنة × نصف شهر`, m(r.firstPart)], [`ما بعد الخمس × شهر كامل`, m(r.secondPart)], ['المكافأة الكاملة (المادة 84)', m(r.full)], ['النسبة المستحقة', reason === 'resign' ? shareLabel : 'المكافأة كاملة']]}
          total={['المستحق', m(r.amount)]}
          notes={[reason === 'resign' ? 'الاستقالة: ثلث بعد سنتين، ثلثان بعد خمس، كاملة بعد عشر (المادة 85).' : 'يدفعها صاحب العمل خلال أسبوع من انتهاء العلاقة، أو أسبوعين إذا أنهاها العامل (المادة 88).']} />
      </div>
      <Actions methodHref={methodHref} note="لا نطلب اسماً ولا جوالاً، والحساب في متصفحك." />
    </div>
  );
}
