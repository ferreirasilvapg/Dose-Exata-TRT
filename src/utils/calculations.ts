import {ESTERS, SYRINGES} from '../data/pharmacology';
import type {
  EsterId,
  PeptideInput,
  PeptideResult,
  PKPoint,
  PKSummary,
  SyringeId,
  TRTInput,
  TRTResult,
} from '../types/calculator';

export function recommendSyringeForVolume(volumeMl: number): SyringeId {
  if (volumeMl <= 0.3) return 'u100_03';
  if (volumeMl <= 0.5) return 'u100_05';
  if (volumeMl <= 1.0) return 'u100_10';
  return 'im_30';
}

export function calculateTRT(input: TRTInput): TRTResult {
  const ester = ESTERS[input.esterId];
  const syringe = SYRINGES[input.syringeId];

  const safeInterval = Math.max(0.5, input.intervalDays);
  const safeConc = Math.max(1, input.concentrationMgPerMl);
  const safeDose = Math.max(0, input.doseMg);
  const injectionsPerWeek = 7 / safeInterval;

  const weeklyDoseMg =
    input.doseInputMode === 'weekly'
      ? safeDose
      : safeDose * injectionsPerWeek;

  const dosePerInjectionMg =
    input.doseInputMode === 'per_injection'
      ? safeDose
      : safeDose / injectionsPerWeek;

  const volumePerInjectionMl = dosePerInjectionMg / safeConc;
  const weeklyVolumeMl = weeklyDoseMg / safeConc;

  const syringeScaleValue = volumePerInjectionMl * syringe.unitsPerMl;
  const u100Units = volumePerInjectionMl * 100;

  const baseTestPerInjectionMg = dosePerInjectionMg * ester.baseFraction;
  const baseTestWeeklyMg = weeklyDoseMg * ester.baseFraction;

  const deadSpaceLossMl = input.includeDeadSpace
    ? (input.customDeadSpaceMl ?? syringe.typicalDeadSpaceMl)
    : 0;

  const totalVialConsumedPerShotMl = volumePerInjectionMl + deadSpaceLossMl;
  const safeVialVol = Math.max(0, input.vialVolumeMl);

  const dosesPerVial =
    totalVialConsumedPerShotMl > 0
      ? Math.floor(safeVialVol / totalVialConsumedPerShotMl)
      : 0;

  const exactDosesPerVial =
    totalVialConsumedPerShotMl > 0
      ? safeVialVol / totalVialConsumedPerShotMl
      : 0;

  const vialDurationDays = exactDosesPerVial * safeInterval;
  const vialDurationWeeks = vialDurationDays / 7;

  const fillPercent = (volumePerInjectionMl / syringe.maxMl) * 100;
  const isOverflow = volumePerInjectionMl > syringe.maxMl + 1e-9;

  // Warn if dose is smaller than 1 minor tick on the selected syringe
  const isMicroDoseWarning =
    syringeScaleValue > 0 && syringeScaleValue < syringe.minorStep;

  return {
    weeklyDoseMg,
    dosePerInjectionMg,
    injectionsPerWeek,
    volumePerInjectionMl,
    weeklyVolumeMl,
    syringeScaleValue,
    u100Units,
    baseTestPerInjectionMg,
    baseTestWeeklyMg,
    deadSpaceLossMl,
    totalVialConsumedPerShotMl,
    dosesPerVial,
    vialDurationDays,
    vialDurationWeeks,
    fillPercent,
    isOverflow,
    isMicroDoseWarning,
    recommendedSyringeId: recommendSyringeForVolume(volumePerInjectionMl),
  };
}

export interface ReverseInput {
  syringeId: SyringeId;
  syringeReading: number; // UI or mL depending on syringe
  concentrationMgPerMl: number;
  intervalDays: number;
  esterId: EsterId;
}

export interface ReverseResult {
  volumeMl: number;
  u100Units: number;
  dosePerInjectionMg: number;
  weeklyDoseMg: number;
  baseTestPerInjectionMg: number;
  baseTestWeeklyMg: number;
  fillPercent: number;
  isOverflow: boolean;
}

export function calculateReverse(input: ReverseInput): ReverseResult {
  const syringe = SYRINGES[input.syringeId];
  const ester = ESTERS[input.esterId];
  const safeReading = Math.max(0, input.syringeReading);
  const volumeMl = safeReading / syringe.unitsPerMl;
  const u100Units = volumeMl * 100;
  const dosePerInjectionMg = volumeMl * Math.max(0, input.concentrationMgPerMl);
  const injectionsPerWeek = 7 / Math.max(0.5, input.intervalDays);
  const weeklyDoseMg = dosePerInjectionMg * injectionsPerWeek;

  return {
    volumeMl,
    u100Units,
    dosePerInjectionMg,
    weeklyDoseMg,
    baseTestPerInjectionMg: dosePerInjectionMg * ester.baseFraction,
    baseTestWeeklyMg: weeklyDoseMg * ester.baseFraction,
    fillPercent: (volumeMl / syringe.maxMl) * 100,
    isOverflow: volumeMl > syringe.maxMl + 1e-9,
  };
}

export function calculatePeptide(input: PeptideInput): PeptideResult {
  const syringe = SYRINGES[input.syringeId];
  const safeVial = Math.max(0.001, input.vialTotalAmount);
  const safeDiluent = Math.max(0.1, input.diluentMl);
  const safeDesired = Math.max(0, input.desiredDose);

  if (input.mode === 'peptide_mg') {
    // Vial is in mg, desired dose is in mcg -> convert vial to mcg
    const totalMcg = safeVial * 1000;
    const mcgPerMl = totalMcg / safeDiluent;
    const volumeMl = safeDesired / mcgPerMl;
    const syringeScaleValue = volumeMl * syringe.unitsPerMl;
    return {
      concentrationPerMl: mcgPerMl,
      volumeMl,
      syringeScaleValue,
      u100Units: volumeMl * 100,
      dosesPerVial: safeDesired > 0 ? Math.floor(totalMcg / safeDesired) : 0,
      fillPercent: (volumeMl / syringe.maxMl) * 100,
      isOverflow: volumeMl > syringe.maxMl + 1e-9,
    };
  }

  // HCG mode: vial in IU, desired dose in IU
  const iuPerMl = safeVial / safeDiluent;
  const volumeMl = safeDesired / iuPerMl;
  const syringeScaleValue = volumeMl * syringe.unitsPerMl;
  return {
    concentrationPerMl: iuPerMl,
    volumeMl,
    syringeScaleValue,
    u100Units: volumeMl * 100,
    dosesPerVial: safeDesired > 0 ? Math.floor(safeVial / safeDesired) : 0,
    fillPercent: (volumeMl / syringe.maxMl) * 100,
    isOverflow: volumeMl > syringe.maxMl + 1e-9,
  };
}

/**
 * Computes instantaneous depot-to-systemic elimination flux (mg/day equivalent of testosterone base)
 * using 1-compartment Bateman first-order absorption & elimination superposition.
 * Since C(t) = (F * D / Vd) * [ka/(ka-ke)] * (e^-ke*t - e^-ka*t),
 * the instantaneous bioavailable delivery rate into systemic clearance is ke * X(t),
 * which integrates over [0, inf) to exactly D * baseFraction.
 */
function batemanRate(
  dt: number,
  doseBaseMg: number,
  halfLifeDays: number,
  absHalfLifeDays: number
): number {
  if (dt < 0) return 0;
  const ke = Math.LN2 / halfLifeDays;
  const ka = Math.LN2 / absHalfLifeDays;
  if (Math.abs(ka - ke) < 1e-5) {
    return doseBaseMg * ke * ke * dt * Math.exp(-ke * dt);
  }
  return doseBaseMg * ((ke * ka) / (ka - ke)) * (Math.exp(-ke * dt) - Math.exp(-ka * dt));
}

function evaluateEsterSchedule(
  esterId: EsterId,
  dosePerShotMg: number,
  intervalDays: number,
  totalDays: number,
  stepDays: number
): {points: PKPoint[]; injectionDays: number[]} {
  const ester = ESTERS[esterId];
  const injectionDays: number[] = [];
  for (let d = 0; d <= totalDays + 1e-9; d += intervalDays) {
    injectionDays.push(Number(d.toFixed(3)));
  }

  const points: PKPoint[] = [];
  for (let t = 0; t <= totalDays + 1e-9; t += stepDays) {
    let rate = 0;
    for (const injDay of injectionDays) {
      if (t < injDay) break;
      const dt = t - injDay;
      if (ester.blendComponents) {
        for (const comp of ester.blendComponents) {
          const compBaseDose = dosePerShotMg * comp.fractionOfBlend * comp.baseFraction;
          rate += batemanRate(dt, compBaseDose, comp.halfLifeDays, comp.absorptionHalfLifeDays);
        }
      } else {
        const baseDose = dosePerShotMg * ester.baseFraction;
        rate += batemanRate(dt, baseDose, ester.halfLifeDays, ester.absorptionHalfLifeDays);
      }
    }
    points.push({
      day: Number(t.toFixed(2)),
      activeLevelMgPerDay: rate,
      relativePercent: 0,
    });
  }

  return {points, injectionDays};
}

export function simulatePharmacokinetics(
  esterId: EsterId,
  weeklyDoseMg: number,
  intervalDays: number,
  compareIntervalDays = 7
): PKSummary {
  const totalDays = 42;
  const stepDays = 0.25; // 6-hour resolution
  const dosePerShot = weeklyDoseMg * (intervalDays / 7);
  const compareDosePerShot = weeklyDoseMg * (compareIntervalDays / 7);

  const primary = evaluateEsterSchedule(esterId, dosePerShot, intervalDays, totalDays, stepDays);
  const comparison = evaluateEsterSchedule(
    esterId,
    compareDosePerShot,
    compareIntervalDays,
    totalDays,
    stepDays
  );

  // Measure steady-state window in final 14 days (days 28..42) or 1 full interval at end
  const windowStart = Math.max(21, totalDays - Math.max(intervalDays * 1.5, 14));
  const steadySlice = primary.points.filter((p) => p.day >= windowStart);

  const steadyPeak = steadySlice.reduce((m, p) => Math.max(m, p.activeLevelMgPerDay), 0);
  const steadyTrough = steadySlice.reduce(
    (m, p) => Math.min(m, p.activeLevelMgPerDay),
    steadyPeak
  );
  const steadyMean =
    steadySlice.reduce((s, p) => s + p.activeLevelMgPerDay, 0) / Math.max(1, steadySlice.length);

  const fluctuationPercent =
    steadyMean > 0 ? ((steadyPeak - steadyTrough) / steadyMean) * 100 : 0;

  const globalMax = Math.max(
    steadyPeak,
    comparison.points.reduce((m, p) => Math.max(m, p.activeLevelMgPerDay), 0),
    0.001
  );

  for (const p of primary.points) {
    p.relativePercent = (p.activeLevelMgPerDay / globalMax) * 100;
  }
  for (const p of comparison.points) {
    p.relativePercent = (p.activeLevelMgPerDay / globalMax) * 100;
  }

  return {
    series: primary.points,
    comparisonSeries: comparison.points,
    steadyPeak,
    steadyTrough,
    steadyMean,
    fluctuationPercent,
    injectionDays: primary.injectionDays,
  };
}

export function generateUpcomingDates(
  startDateIso: string,
  intervalDays: number,
  count = 10
): Date[] {
  const base = startDateIso ? new Date(`${startDateIso}T09:00:00`) : new Date();
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(safeBase.getTime() + i * intervalDays * 86400000);
    dates.push(d);
  }
  return dates;
}

export function buildICSContent(
  title: string,
  description: string,
  dates: Date[]
): string {
  const formatICSDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  const events = dates
    .map((date, idx) => {
      const end = new Date(date.getTime() + 15 * 60000);
      return [
        'BEGIN:VEVENT',
        `UID:doseexata-${date.getTime()}-${idx}@doseexata.app`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(date)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DoseExata TRT//Precision Syringe Calculator//PT',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}
