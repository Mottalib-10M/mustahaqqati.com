import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'حاسبات مستحقاتي', method: 'طريقة الحساب', about: 'من نحن', widget: 'ضع الحاسبة في موقعك', contact: 'التواصل', editorial: 'سياسة التحرير', privacy: 'الخصوصية', terms: 'الإشعار القانوني', cookies: 'ملفات تعريف الارتباط' };
const GROUP_LABEL: Record<Group, string> = { rawatib: 'سلالم الرواتب', maratib: 'المراتب', muallimin: 'المعلمون', khidma: 'نهاية الخدمة', muwatin: 'حساب المواطن', taqaud: 'التقاعد' };
export const GROUPS_ORDER: Group[] = ['rawatib', 'maratib', 'muallimin', 'khidma', 'muwatin', 'taqaud'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'ar') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
// Le menu regroupe les مراتب sous « سلالم الرواتب » : quinze liens de plus rendraient la barre illisible.
const NAV_GROUPS: Group[] = ['rawatib', 'muallimin', 'khidma', 'muwatin', 'taqaud'];
export function navCategories(lang: Locale): NavCategory[] {
  return NAV_GROUPS.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [
  { label: GROUP_LABEL.rawatib, links: [...inGroup('rawatib', lang), ...inGroup('muallimin', lang)] },
  { label: `${GROUP_LABEL.khidma} و${GROUP_LABEL.muwatin}`, links: [...inGroup('khidma', lang), ...inGroup('muwatin', lang)] },
  { label: GROUP_LABEL.taqaud, links: inGroup('taqaud', lang) },
  { label: 'عن الموقع', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
export const popularLinks = (lang: Locale): NavLink[] => inGroup('maratib', lang);
