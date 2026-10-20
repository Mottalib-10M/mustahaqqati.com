/** Retraite mensuelle : nouveau نظام التأمينات (2024), régime civil, militaire ou ancien régime privé. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Ledger from './Ledger';
import Actions from './Actions';
import { P } from '../../lib/engine/params';
import { newLawPension, civilPension, privateOldPension } from '../../lib/engine/pension';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

const m = (n: number) => formatMoney(Math.round(n));
type Regime = 'new' | 'civil' | 'military' | 'privateOld';
const REG: Array<{ value: Regime; label: string }> = [
  { value: 'new', label: 'نظام التأمينات الجديد (من 3 يوليو 2024)' },
  { value: 'civil', label: 'التقاعد المدني (موظف حكومي قبل 2024)' },
  { value: 'military', label: 'التقاعد العسكري' },
  { value: 'privateOld', label: 'التأمينات القديم (قطاع خاص قبل 2024)' },
];
const isReg = (v: string): v is Regime => REG.some((r) => r.value === v);
interface Props { regime?: Regime; salary?: number; years?: number; early?: number; methodHref: string; idPrefix?: string }

export default function PensionCalc({ regime: r0 = 'new', salary: s0 = 12000, years: y0 = 30, early: e0 = 0, methodHref, idPrefix = 'p' }: Props) {
  const [regime, setRegime] = useState<Regime>(r0);
  const [sal, setSal] = useState(s0);
  const [years, setYears] = useState(y0);
  const [early, setEarly] = useState(e0);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    const r = str(u, 'r', r0); if (isReg(r)) setRegime(r);
    setSal(num(u, 's', s0)); setYears(num(u, 'y', y0)); setEarly(num(u, 'e', e0));
  }, []);
  useEffect(() => { updateURL({ r: regime, s: sal, y: years, e: regime === 'new' && early ? early : undefined }); }, [regime, sal, years, early]);
  const id = (k: string) => `${idPrefix}-${k}`;
  const n = P.pension.newLaw;
  let value = 0; let rows: Array<[string, string]> = []; let notes: string[] = []; let sub = '';
  if (regime === 'new') {
    const r = newLawPension({ avg: sal, months: years * 12, earlyMonths: early * 12 });
    value = r.pension;
    sub = r.eligible ? `${formatPercent(r.ratio, 1)} من متوسط أعلى ${formatNumber(n.bestMonths)} شهراً` : early > 0 ? `التقاعد المبكر يتطلب ${formatNumber(n.earlyMonths)} شهر اشتراك` : `الحد الأدنى للاستحقاق ${formatNumber(n.minMonths)} شهراً`;
    rows = [['متوسط الأجر الخاضع للاشتراك', m(Math.min(sal, n.ceiling))], ['المعاش قبل التخفيض', m(r.base)], ...(early > 0 ? [[`تخفيض ${formatPercent(n.earlyCutPerYear, 0)} عن كل سنة`, `− ${m(r.cut)}`] as [string, string]] : []), ...(r.floor ? [['الحد الأدنى لهذه المدة', m(r.floor)] as [string, string]] : [])];
    notes = [`السن النظامية ${formatNumber(n.age)} سنة، يطبق على من لم يسبق له اشتراك قبل 3 يوليو 2024؛ ومن كان مشتركاً قبله يبقى على نظامه السابق مع جدول انتقالي للسن.`];
  } else if (regime === 'civil') {
    value = civilPension(sal, years);
    sub = `آخر راتب أساسي × ${formatNumber(Math.min(years, P.pension.civil.maxYears))} ÷ ${P.pension.civil.divisor}`;
    rows = [['آخر راتب أساسي', m(sal)], ['النسبة', formatPercent(Math.min(years, P.pension.civil.maxYears) / P.pension.civil.divisor, 1)]];
    notes = [`يستحق المعاش بعد ${formatNumber(P.pension.civil.serviceYears)} سنة خدمة، أو عند الستين مع ${formatNumber(P.pension.civil.minServiceAt60)} سنوات على الأقل.`];
  } else if (regime === 'military') {
    value = Math.min(sal, (sal * years) / P.pension.military.divisor);
    sub = `آخر راتب أساسي × ${formatNumber(years)} ÷ ${P.pension.military.divisor}`;
    rows = [['آخر راتب أساسي', m(sal)], ['النسبة', formatPercent(Math.min(1, years / P.pension.military.divisor), 1)]];
    notes = ['لا يتجاوز المعاش آخر راتب أساسي.'];
  } else {
    value = privateOldPension(sal, years);
    sub = `متوسط آخر ${formatNumber(P.pension.privateOld.avgMonths)} شهراً × ${formatNumber(years)} ÷ ${P.pension.privateOld.divisor}`;
    rows = [['متوسط آخر سنتين', m(sal)], ['النسبة', formatPercent(Math.min(1, years / P.pension.privateOld.divisor), 1)]];
    notes = [`السن ${formatNumber(P.pension.privateOld.age)} مع ${formatNumber(P.pension.privateOld.minMonths)} شهراً، أو أي سن بعد ${formatNumber(P.pension.privateOld.earlyMonths)} شهر اشتراك.`];
  }
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start gap-x-4 gap-y-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <SelectField id={id('regime')} label="النظام" value={regime} onChange={(v) => { if (isReg(v)) setRegime(v); }} options={REG} className="sm:col-span-2" />
          <NumberField id={id('salary')} label={regime === 'new' ? 'متوسط الأجر الشهري (أعلى 15 سنة)' : regime === 'privateOld' ? 'متوسط أجر آخر سنتين' : 'آخر راتب أساسي'} value={sal} onChange={setSal} unit="ريال" max={200000} />
          <NumberField id={id('years')} label="سنوات الاشتراك أو الخدمة" value={years} onChange={setYears} unit="سنة" max={60} />
          {regime === 'new' && <NumberField id={id('early')} label="سنوات التقاعد قبل السن النظامية" value={early} onChange={setEarly} unit="سنة" max={10} help="صفر إذا تقاعدت عند السن النظامية" />}
        </form>
        <Ledger label="المعاش الشهري التقديري" value={m(value)} sub={sub} rows={rows} total={['المعاش', m(value)]} notes={notes} />
      </div>
      <Actions methodHref={methodHref} note="الحساب في متصفحك، ولا يُرسل شيء." />
    </div>
  );
}
