/**
 * Règles de rédaction de chaque fichier de page avant le build (RECETTE §6, §7, §11, §21) : longueurs des
 * snippets, terme-clé en tête, bloc citable de 120 mots, FAQ de 40 à 90 mots jamais reprise, pas de tiret
 * cadratin, liens internes vers des pages existantes, longueur minimale par type de page.
 */
import { describe, it, expect } from 'vitest';
import { PAGES } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';

const h = helpers(true);
const text = (html: string) => html.replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const words = (s: string) => text(s).split(/\s+/).filter((w) => /[\u0600-\u06FFA-Za-z0-9]/.test(w)).length;
const BAD_START = /^(السعودية|المملكة|السعودي|حاسبة|احسب|حساب الراتب|كم|ما|ماذا|هل|كيف|متى|أسئلة|من نحن|طريقة)(\s|$)/;
const allQ = new Map<string, string>();
const titles = new Map<string, string>();

describe.each(PAGES.map((p) => [p.id, p] as const))('%s', (_id, p) => {
  it('snippets', () => {
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeGreaterThanOrEqual(50);
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeLessThanOrEqual(60);
    expect(p.description.length, `description ${p.description.length}: ${p.description}`).toBeGreaterThanOrEqual(150);
    expect(p.description.length, `description ${p.description.length}: ${p.description}`).toBeLessThanOrEqual(160);
    expect(BAD_START.test(p.title), `title starts with a banned word: ${p.title}`).toBe(false);
    expect(/[—]|\s[:;!?؟،]/.test(p.title + p.description), 'em dash or space before punctuation').toBe(false);
    expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    expect(titles.has(p.title) && titles.get(p.title) !== p.id, `title reused: ${p.title}`).toBe(false);
    titles.set(p.title, p.id);
  });
  it('citable block of 120 words or more', () => {
    expect(words(p.resume(h))).toBeGreaterThanOrEqual(120);
  });
  it('FAQ: 3 to 8 questions of 40 to 90 words, never reused', () => {
    const f = p.faqs(h);
    expect(f.length).toBeGreaterThanOrEqual(3);
    expect(f.length).toBeLessThanOrEqual(8);
    for (const x of f) {
      const n = words(x.a);
      expect(n, `${x.q} (${n} words)`).toBeGreaterThanOrEqual(40);
      expect(n, `${x.q} (${n} words)`).toBeLessThanOrEqual(90);
      const k = x.q.replace(/[^\u0600-\u06FF0-9 ]/g, '').trim();
      expect(allQ.has(k) && allQ.get(k) !== p.id, `question reused from ${allQ.get(k)}: ${x.q}`).toBe(false);
      allQ.set(k, p.id);
    }
  });
  it('body: length, links, no em dash, tool', () => {
    const b = p.body(h);
    const all = p.intro + p.resume(h) + b + p.faqs(h).map((f) => f.q + f.a).join(' ');
    expect(/—|&mdash;/.test(all), 'em dash').toBe(false);
    const n = words(p.resume(h)) + words(b);
    const min = p.tool ? 480 : 1200;
    expect(n, `${n} words (min ${min})`).toBeGreaterThanOrEqual(min);
    expect(p.tool || p.mini, 'every page carries a calculator').toBeTruthy();
    expect(p.sources.length).toBeGreaterThanOrEqual(2);
    for (const id of p.related) expect(PAGES.some((x) => x.id === id) || ['home', 'method'].includes(id), `related ${id}`).toBe(true);
  });
});
