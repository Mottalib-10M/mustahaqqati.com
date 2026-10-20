/** Formatage monétaire/numérique localisé (configuré par site via site-config). */
import { LOCALE_TAG, CURRENCY } from '../data/site-config';

/** Arabe à chiffres latins : c'est l'écriture des bulletins de paie, des barèmes officiels et de Qiwa. */
export const NUM_TAG = `${LOCALE_TAG}-u-nu-latn`;
const cache = new Map<string, Intl.NumberFormat>();
function nf(opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const k = JSON.stringify(opts);
  if (!cache.has(k)) cache.set(k, new Intl.NumberFormat(NUM_TAG, opts));
  return cache.get(k)!;
}
/** Montant en riyals : « 8,010 ريال ». La devise `CURRENCY` reste dans les données structurées. */
export const CURRENCY_CODE = CURRENCY;
export function formatMoney(value: number, decimals = 0): string {
  return `${nf({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)}\u00a0ريال`;
}
export function formatNumber(value: number, decimals = 0): string {
  return nf({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}
/** Nombre tiré des paramètres et inséré dans un texte : décimales utiles seulement (13,18 · 111,8 · 548),
 *  toujours au format de la locale. Jamais `{P.x}` ni `toFixed` dans une page (RECETTE §4, §17.4). */
export function formatDecimal(value: number, max = 2): string {
  return nf({ maximumFractionDigits: max }).format(value);
}
export function formatPercent(value: number, decimals = 1): string {
  // Toutes langues : espace insécable avant % (RECETTE §7) ; Intl n'en met pas en anglais (« 3.5% »).
  return nf({ style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value).replace(/(\d)\s?%/, '$1\u00a0%');
}
/** Chiffres arabes (٠١٢…, ۰۱۲…) et séparateurs arabes ramenés aux chiffres latins avant lecture. */
export function latinDigits(input: string): string {
  return input.replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660)).replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06f0)).replace(/\u066B/g, '.').replace(/\u066C/g, ',');
}
export function parseLocaleNumber(input: string): number {
  const cleaned = latinDigits(input).replace(/[^\d.,-]/g, '');
  // Détecte le séparateur décimal : le dernier des deux symboles
  const lastComma = cleaned.lastIndexOf(','), lastDot = cleaned.lastIndexOf('.');
  let s = cleaned;
  if (lastComma > lastDot) s = cleaned.replace(/\./g, '').replace(',', '.');
  // « 35.000 » en danois, néerlandais ou allemand : point séparateur de milliers, pas décimal.
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) s = cleaned.replace(/\./g, '');
  else s = cleaned.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/** Date de mise à jour écrite dans la langue de la page (registre 2026-09-21) : « 27 September 2026 »,
 *  jamais le format machine. Fuseau UTC forcé, sinon la date recule d'un jour à l'ouest de Greenwich.
 *  Le format ISO reste dans l'attribut `datetime` de la balise <time>. */
export function displayDate(iso: string, langTag: string): string {
  const tag = langTag.startsWith('ar') ? `${langTag}-u-ca-gregory-nu-latn` : langTag;
  const s = new Date(`${iso}T00:00:00Z`).toLocaleDateString(tag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  // Français : « 1er novembre », jamais « 1 novembre » (ordinal du premier jour du mois).
  return langTag.startsWith('fr') ? s.replace(/^1 /, '1er ') : s;
}

/** Date hégirienne (calendrier Umm al-Qura) d'une date grégorienne ISO : « 9 جمادى الأولى 1448 هـ ». */
export function hijriDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
/** Année hégirienne Umm al-Qura d'une date ISO. */
export function hijriYear(iso: string): number {
  const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', timeZone: 'UTC' }).formatToParts(new Date(`${iso}T12:00:00Z`));
  return parseInt(p.find((x) => x.type === 'year')!.value, 10);
}
