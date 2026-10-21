/** Fichier de paramètres typé. Tout chiffre officiel affiché ou calculé vient d'ici (RECETTE §4). */
import RAW from '../../data/params-2026.json';
export type SourceKey = keyof typeof RAW.sources;
export interface Prog { first: number; inc: number; steps: number }
export interface Band { from: number; to: number; amount: number }
export type RankId = 'musaid' | 'mumaris' | 'mutaqaddim' | 'khabir';
export interface Params {
  retrieved_at: string; today: string; hijriToday: string;
  general: { decree: string; from_hijri: string; from: string; grades: Record<string, Prog> };
  teachers: { from_hijri: string; from: string; ranks: Record<RankId, { levels: Prog[] }>; names: Record<RankId, string>; equiv: Record<RankId, number[]>;
    eos: { minYears: number; brackets: number[]; perYear: Record<RankId, number[]> } };
  transport: Band[]; mission: Band[];
  missionAbroad: Array<{ from: number; to: number; c: number; b: number; a: number; high: number }>;
  missionRules: { housedFed: number; housed: number; extraTransportShare: number; abroadTransport1415: number; maxDays: number; yearCap551: number };
  pension: {
    civil: { employee: number; state: number; divisor: number; maxYears: number; age: number; serviceYears: number; minServiceAt60: number };
    military: { employee: number; state: number; divisor: number };
    privateOld: { employee: number; employer: number; divisor: number; avgMonths: number; age: number; ageWomen: number; minMonths: number; earlyMonths: number; minPensionLaw: number };
    newLaw: {
      from: string; from_hijri: string; decree: string; decreeDate_hijri: string; accrual: number; bestMonths: number; maxRatio: number; age: number; minMonths: number;
      earlyMonths: number; earlyMaxMonths: number; earlyCutPerYear: number; lateBonusPerYear: number; minPensionFull: number; minPensionFullMonths: number; minPensionAtMin: number; ceiling: number;
      rates: Array<{ afterMonths: number; total: number }>; saned: number; transitionAge: Array<[number, number]>; transitionEarly: Array<[number, number, number]>;
    };
  };
  eos: { halfMonthYears: number; resignation: Array<{ from: number; to: number; share: number }>; monthDays: number };
  ca: { observed: string; base: number; adultW: number; childW: number; capW: number; taper: number; stop: number; stopCap: number; slope: number; floor: number; extraUntil: string;
    checks: Array<{ adults: number; children: number; income: number; support: number }>; thresholds: Array<{ adults: number; children: number; taper: number; stop: number }> };
  sources: Record<SourceKey, { label: { ar: string }; url: string }>;
}
export const P = RAW as unknown as Params;
export const TODAY = P.today;
