/** llms.txt (RECETTE §21) : ce qu'est le site, d'où viennent ses chiffres, ses pages. Construit depuis les données. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
import { P } from '../lib/engine/params';
export const GET: APIRoute = () => {
  const lines = [
    '# مستحقاتي',
    '',
    `> حاسبات سعودية تعمل في المتصفح: سلم رواتب الموظفين العام المعتمد بالأمر ${P.general.decree} في ${P.general.from_hijri}هـ (${P.general.from})، وسلم الوظائف التعليمية المعمول به منذ ${P.teachers.from_hijri}هـ (${P.teachers.from})، مع بدل النقل والانتداب من لائحة الحقوق والمزايا المالية؛ مكافأة نهاية الخدمة وفق المواد 2 و84 إلى 88 من نظام العمل على الأجر الفعلي الأخير؛ تقدير دعم حساب المواطن يعيد نتائج الحاسبة التقديرية الرسمية كما رصدت في ${P.ca.observed} (ليس قراراً)؛ المعاش وفق نظام التأمينات الاجتماعية الجديد م/273 والتقاعد المدني والعسكري والنظام القديم. لا يتضمن سلم العسكريين. المصادر روجعت في ${LAST_UPDATED}. الناشر Radif Partners، مستقل، ليس جهة حكومية.`,
    '',
    '## الحاسبات والصفحات',
    `- [مستحقاتي](${SITE_URL}${route('home', 'ar')}): الراتب الصافي، نهاية الخدمة، حساب المواطن، التقاعد.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'ar')}): ${p.card}`),
    '',
    '## المنهج',
    `- [طريقة الحساب](${SITE_URL}${route('method', 'ar')})`,
    `- [من نحن](${SITE_URL}${route('about', 'ar')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
