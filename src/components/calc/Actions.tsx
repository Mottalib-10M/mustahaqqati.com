/** Partager, imprimer, méthode : sous chaque calculateur complet. */
import { useState } from 'react';
export default function Actions({ methodHref, note }: { methodHref: string; note: string }) {
  const [copied, setCopied] = useState(false);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* presse-papiers refusé */ } };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'نُسخ الرابط' : 'انسخ رابط هذه النتيجة'}</button>
      <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">طباعة</button>
      <a href={methodHref} className="text-accent-700 underline underline-offset-2">كيف نحسب</a>
      <span className="text-xs text-navy-600">{note}</span>
    </div>
  );
}
