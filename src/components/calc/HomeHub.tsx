/** Accueil : quatre calculs derrière des onglets (salaire, fin de service, حساب المواطن, retraite). L'onglet
 *  choisi va dans le lien partageable (?t=). Premier rendu = onglet salaire (hydratation, RECETTE §17.5). */
import { useEffect, useState } from 'react';
import SalaryCalc from './SalaryCalc';
import EosCalc from './EosCalc';
import CaCalc from './CaCalc';
import PensionCalc from './PensionCalc';
import { readParams, str } from '../../lib/url-state';
type Tab = 'salary' | 'eos' | 'ca' | 'pension';
const TABS: Array<[Tab, string]> = [['salary', 'راتبي الصافي'], ['eos', 'نهاية الخدمة'], ['ca', 'حساب المواطن'], ['pension', 'معاش التقاعد']];
export default function HomeHub({ methodHref }: { methodHref: string }) {
  const [tab, setTab] = useState<Tab>('salary');
  useEffect(() => { const t = str(readParams(window.location.search), 't', 'salary'); if (TABS.some(([k]) => k === t)) setTab(t as Tab); }, []);
  const pick = (t: Tab) => { setTab(t); try { const u = new URL(window.location.href); u.search = t === 'salary' ? '' : `?t=${t}`; History.prototype.replaceState.call(window.history, null, '', u.pathname + u.search); } catch { /* sans effet */ } };
  return (
    <div>
      <div className="tabs mb-3" role="group" aria-label="اختر الحساب">
        {TABS.map(([k, l]) => <button key={k} type="button" className="tab" aria-pressed={tab === k} onClick={() => pick(k)}>{l}</button>)}
      </div>
      {tab === 'salary' && <SalaryCalc methodHref={methodHref} idPrefix="hs" grade={6} step={1} />}
      {tab === 'eos' && <EosCalc methodHref={methodHref} idPrefix="he" />}
      {tab === 'ca' && <CaCalc methodHref={methodHref} idPrefix="hc" />}
      {tab === 'pension' && <PensionCalc methodHref={methodHref} idPrefix="hp" />}
    </div>
  );
}
