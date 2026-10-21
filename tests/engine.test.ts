import { describe, it, expect } from 'vitest';
import { P } from '../src/lib/engine/params';
import { generalBasic, generalRow, teacherBasic, transportFor, missionFor, timeline } from '../src/lib/engine/scales';
import { salary, newLawRate } from '../src/lib/engine/salary';
import { eos, resignShare } from '../src/lib/engine/eos';
import { ca } from '../src/lib/engine/ca';
import { newLawPension, newLawFloor, transitionAgeMonths, transitionEarlyMonths, civilPension, privateOldPension } from '../src/lib/engine/pension';

describe('سلم رواتب الموظفين العام (4097/م ب)', () => {
  it('cellules de la copie officielle', () => {
    expect(generalBasic(1, 1)).toBe(3000);
    expect(generalBasic(1, 15)).toBe(4890);
    expect(generalBasic(8, 1)).toBe(8010);
    expect(generalBasic(8, 15)).toBe(13820);
    expect(generalBasic(15, 10)).toBe(28640);
    expect(generalBasic(11, 14)).toBe(18705);
    expect(generalBasic(6, 15)).toBe(10335);
  });
  it('échelon borné au dernier de la مرتبة', () => { expect(generalBasic(15, 15)).toBe(28640); expect(generalRow(13)).toHaveLength(12); });
  it('indemnités par مرتبة', () => {
    expect(transportFor(5)).toBe(500); expect(transportFor(6)).toBe(700); expect(transportFor(13)).toBe(900); expect(transportFor(14)).toBe(1200); expect(transportFor(15)).toBeNull();
    expect(missionFor(3)).toBe(150); expect(missionFor(6)).toBe(320); expect(missionFor(11)).toBe(600); expect(missionFor(15)).toBe(800);
  });
  it('échéancier', () => { const t = timeline((s) => generalBasic(7, s), 15, 13, 1448); expect(t.map((r) => r.basic)).toEqual([11390, 11755, 12120]); expect(t[2].year).toBe(1450); });
});

describe('سلم رواتب الوظائف التعليمية', () => {
  it('cellules du PDF du ministère', () => {
    expect(teacherBasic('musaid', 1, 1)).toBe(5200);
    expect(teacherBasic('musaid', 6, 6)).toBe(17400);
    expect(teacherBasic('mumaris', 1, 1)).toBe(7570);
    expect(teacherBasic('mumaris', 5, 3)).toBe(21250);
    expect(teacherBasic('mutaqaddim', 4, 4)).toBe(21770);
    expect(teacherBasic('khabir', 3, 6)).toBe(23170);
    expect(teacherBasic('khabir', 1, 1)).toBe(12650);
  });
});

describe('net et cotisation retraite', () => {
  it('régime civil : 9 % du salaire de base', () => {
    const r = salary({ basic: 8010, transport: 700, other: 0, regime: 'civil' });
    expect(r.pension).toBeCloseTo(720.9, 5); expect(r.net).toBeCloseTo(7989.1, 5);
  });
  it('nouveau régime : taux par paliers depuis le 3/7/2024', () => {
    expect(newLawRate('2024-07-03')).toBe(0.18); expect(newLawRate('2025-07-02')).toBe(0.18);
    expect(newLawRate('2025-07-31')).toBe(0.18); expect(newLawRate('2025-08-01')).toBe(0.19); expect(newLawRate('2026-10-20')).toBe(0.20);
    expect(newLawRate('2027-07-31')).toBe(0.2); expect(newLawRate('2027-08-01')).toBe(0.21); expect(newLawRate('2028-08-01')).toBe(0.22);
    expect(salary({ basic: 10000, transport: 0, other: 0, regime: 'new', date: '2026-10-20' }).pension).toBeCloseTo(1000, 5);
  });
});

describe('مكافأة نهاية الخدمة (art. 84, 85)', () => {
  it('demi-mois puis un mois', () => {
    expect(eos({ wage: 10000, years: 5, reason: 'employer' }).amount).toBeCloseTo(25000, 5);
    expect(eos({ wage: 10000, years: 8, reason: 'employer' }).amount).toBeCloseTo(55000, 5);
    expect(eos({ wage: 6000, years: 3, months: 6, reason: 'employer' }).amount).toBeCloseTo(10500, 5);
  });
  it('démission : rien, un tiers, deux tiers, tout', () => {
    expect(resignShare(1.9)).toBe(0); expect(resignShare(2)).toBeCloseTo(1 / 3); expect(resignShare(5)).toBeCloseTo(1 / 3);
    expect(resignShare(5.01)).toBeCloseTo(2 / 3); expect(resignShare(10)).toBe(1);
    expect(eos({ wage: 9000, years: 7, reason: 'resign' }).amount).toBeCloseTo((22500 + 18000) * 2 / 3, 5);
    expect(eos({ wage: 9000, years: 7, reason: 'woman' }).amount).toBeCloseTo(40500, 5);
  });
});

describe('حساب المواطن : réponses de la حاسبة تقديرية officielle (2026-10-20)', () => {
  for (const c of P.ca.checks) it(`${c.adults} adultes, ${c.children} enfants, revenu ${c.income}`, () => {
    expect(Math.abs(ca(c).support - c.support)).toBeLessThanOrEqual(1);
  });
  for (const t of P.ca.thresholds) it(`seuils ${t.adults}/${t.children}`, () => {
    const r = ca({ ...t, income: 0 }); expect(r.taper).toBe(t.taper); expect(r.stop).toBe(t.stop);
  });
  it('plafond', () => { const r = ca({ adults: 6, children: 4, income: 0 }); expect(r.support).toBe(2088); expect(r.stop).toBe(20001); });
});

describe('retraite', () => {
  it('nouveau régime : 2,25 % par an, plafond 100 %', () => {
    expect(newLawPension({ avg: 10000, months: 300 }).pension).toBeCloseTo(5625, 5);
    expect(newLawPension({ avg: 10000, months: 600 }).pension).toBeCloseTo(10000, 5);
    expect(newLawPension({ avg: 3000, months: 480 }).pension).toBe(4000);
    expect(newLawPension({ avg: 10000, months: 170 }).eligible).toBe(false);
  });
  it('plancher proportionnel', () => { expect(newLawFloor(180)).toBe(2000); expect(newLawFloor(330)).toBe(3000); expect(newLawFloor(480)).toBe(4000); });
  it('anticipée : 3 % par an, le plus petit des deux écarts', () => {
    const r = newLawPension({ avg: 10000, months: 400, earlyMonths: 60 });
    expect(r.cut).toBeCloseTo(10000 * 0.75 * 0.03 * 5, 5);
    expect(newLawPension({ avg: 10000, months: 350, earlyMonths: 12 }).eligible).toBe(false);
  });
  it('transition', () => {
    expect(transitionAgeMonths(28)).toBe(780); expect(transitionAgeMonths(29.5)).toBe(776); expect(transitionAgeMonths(48.2)).toBe(700);
    expect(transitionEarlyMonths(100)).toBe(360); expect(transitionEarlyMonths(185)).toBe(348); expect(transitionEarlyMonths(239)).toBe(300);
  });
  it('régimes anciens', () => {
    expect(civilPension(12000, 30)).toBe(9000); expect(civilPension(12000, 45)).toBe(12000);
    expect(privateOldPension(8000, 25)).toBe(5000); expect(privateOldPension(8000, 50)).toBe(8000);
  });
});
import { teacherEquivGrade } from '../src/lib/engine/scales';
describe('équivalence enseignants (art. 30)', () => {
  it('rang × niveau → مرتبة', () => { expect(teacherEquivGrade('musaid', 1)).toBe(5); expect(teacherEquivGrade('mumaris', 1)).toBe(7); expect(teacherEquivGrade('khabir', 3)).toBe(12); expect(transportFor(teacherEquivGrade('mumaris', 2))).toBe(700); expect(transportFor(teacherEquivGrade('musaid', 1))).toBe(500); });
});

import { teacherEos } from '../src/lib/engine/teacher-eos';
describe('مكافأة نهاية الخدمة للمعلمين (لائحة الوظائف التعليمية، المادة 29)', () => {
  // Tableau de l'art. 29 (PDF hrsd.gov.sa, p. 22), lu le 2026-10-21 : 800 / 1100 / 1500 / 2000 / 3000 pour معلم/مساعد معلم.
  it('rien sous dix ans complets', () => {
    expect(teacherEos('khabir', 9.9).amount).toBeNull();
    expect(teacherEos('khabir', 9.9).eligible).toBe(false);
  });
  it('années complètes × montant de la tranche', () => {
    expect(teacherEos('musaid', 10).amount).toBe(8000);
    expect(teacherEos('mumaris', 15).amount).toBe(13500);
    expect(teacherEos('mumaris', 16).amount).toBe(19200);
    expect(teacherEos('mutaqaddim', 30.7).amount).toBe(30 * 2200);
    expect(teacherEos('khabir', 31).amount).toBe(31 * 3500);
    expect(teacherEos('musaid', 26).perYear).toBe(2000);
  });
});
