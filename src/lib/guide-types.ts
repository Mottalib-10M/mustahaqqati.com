/**
 * Une page = UN fichier de données dans `src/content/pages/<id>.ts` : URL, snippets, H1, chapeau, bloc
 * citable, FAQ, corps, sources, outil. Mode d'emploi : CONTRIBUTING-SA.md à la racine.
 */
import type { SourceKey } from './engine/params';
import type { Helpers } from './helpers';

export type Group = 'rawatib' | 'maratib' | 'muallimin' | 'khidma' | 'muwatin' | 'taqaud';
export interface FAQ { q: string; a: string }
/** Outils : `salary` (props mode, grade, rank, level, step), `eos` (wage, years, reason), `ca` (adults,
 *  children, income), `pension` (regime, avg, years), mini-outils `resign`, `timeline`, `floor`. */
export interface ToolDef { kind: string; props?: Record<string, string | number | boolean> }

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Outil principal, premier écran : la page est une page outil (`data-outil`). */
  tool?: ToolDef;
  /** Mini-outil placé juste après le bloc citable d'une page de lecture (guide). */
  mini?: ToolDef;
  related: string[];
  sources: SourceKey[];
  /** Slug latin, sans année. */
  slug: string;
  nav: string;
  card: string;
  /** 50 à 60 caractères, terme-clé en tête. */
  title: string;
  /** 150 à 160 caractères. */
  description: string;
  h1: string;
  intro: string;
  /** Bloc citable, 120 mots ou plus (viser 130 en arabe), un seul paragraphe (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  /** HTML. Un outil se place dans le corps avec `<!--tool:resign-->` ou `<!--tool:salary|{"grade":7}-->`. */
  body: (h: Helpers) => string;
}
export const definePage = (g: PageDef): PageDef => g;
