import type { Locale } from './routes';
import { P } from '../lib/engine/params';
import { hijriDate } from '../lib/format';
const ar = {
  updatedOn: 'رُوجعت الأرقام في', editorialPolicy: 'سياسة التحرير', contactLabel: 'التواصل', reviewedBy: 'راجع الحساب',
  skipToContent: 'إلى المحتوى', mainNav: 'القائمة الرئيسية', breadcrumbLabel: 'المسار', breadcrumbHome: 'الرئيسية', menuOpen: 'فتح القائمة',
  faqTitle: 'أسئلة يطرحها الموظفون والعاملون', relatedCalculators: 'احسب بعد ذلك', sourcesTitle: 'النصوص الرسمية التي بُنيت عليها الصفحة', writtenBy: 'إعداد',
  asOf: `الأرقام كما هي في ${hijriDate(P.today)}`, lastUpdated: 'آخر مراجعة', footerValidated: 'كل خلية في السلالم مطابقة للنسخ الرسمية المؤرخة، وكل حالة في الاختبارات تعيد الرقم الرسمي', footerBrowser: 'الحساب يجري في متصفحك · بلا تسجيل · بلا رقم جوال · مجاناً',
  footerPopular: 'رواتب المراتب من الأولى إلى الخامسة عشرة',
  footerDisclaimer: 'مستحقاتي موقع مستقل تنشره Radif Partners، وليس جهة حكومية ولا جهة عمل ولا بنكاً ولا مكتب موارد بشرية، ولا يتحدث باسم أي وزارة أو برنامج. النتائج تقديرية مبنية على النصوص المنشورة؛ والمرجع الملزم هو مسير راتبك وقرار جهتك أو البرنامج.',
  notFound: 'لا توجد صفحة على هذا العنوان. حاسبات الراتب ونهاية الخدمة وحساب المواطن والتقاعد على بعد نقرة.',
  readMore: 'اقرأ الفقرة كاملة', disclaimer: 'حُسب وفق السلالم والنصوص المذكورة بتواريخها؛ ليس استشارة قانونية ولا مالية.',
};
export function t(_lang: Locale) { return ar; }
