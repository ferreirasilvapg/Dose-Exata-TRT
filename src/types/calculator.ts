export type Language = 'pt' | 'en';

export type AppTab = 'trt' | 'reverse' | 'peptide' | 'protocols';

export type EsterId =
  | 'cypionate'
  | 'enanthate'
  | 'propionate'
  | 'undecanoate'
  | 'sustanon'
  | 'base';

export type SyringeId =
  | 'u100_03'
  | 'u100_05'
  | 'u100_10'
  | 'u40_10'
  | 'im_30';

export type DoseInputMode = 'weekly' | 'per_injection';

export interface EsterSpec {
  id: EsterId;
  namePt: string;
  nameEn: string;
  shortName: string;
  /** Ratio of pure testosterone base MW (288.42) to esterified MW */
  baseFraction: number;
  /** Primary elimination half-life in days */
  halfLifeDays: number;
  /** Absorption half-life in days */
  absorptionHalfLifeDays: number;
  /** Common brand names for context */
  examplesPt: string;
  examplesEn: string;
  /** Sub-components for blends like Sustanon/Durateston */
  blendComponents?: Array<{
    fractionOfBlend: number;
    baseFraction: number;
    halfLifeDays: number;
    absorptionHalfLifeDays: number;
  }>;
}

export interface SyringeSpec {
  id: SyringeId;
  labelPt: string;
  labelEn: string;
  shortLabel: string;
  maxMl: number;
  scaleType: 'U-100' | 'U-40' | 'mL';
  /** Number of scale units per 1 mL (100 for U-100, 40 for U-40, 1 for mL) */
  unitsPerMl: number;
  /** Max value shown on the syringe barrel */
  maxScaleValue: number;
  /** Minor tick step in scale units */
  minorStep: number;
  /** Major labeled tick step in scale units */
  majorStep: number;
  /** Typical dead-space volume retained in needle/hub in mL */
  typicalDeadSpaceMl: number;
  needleNotePt: string;
  needleNoteEn: string;
}

export interface FrequencyPreset {
  id: string;
  labelPt: string;
  labelEn: string;
  shortLabel: string;
  intervalDays: number;
}

export interface TRTInput {
  doseInputMode: DoseInputMode;
  doseMg: number;
  intervalDays: number;
  concentrationMgPerMl: number;
  esterId: EsterId;
  syringeId: SyringeId;
  vialVolumeMl: number;
  includeDeadSpace: boolean;
  customDeadSpaceMl?: number;
}

export interface TRTResult {
  weeklyDoseMg: number;
  dosePerInjectionMg: number;
  injectionsPerWeek: number;
  volumePerInjectionMl: number;
  weeklyVolumeMl: number;
  /** Value on the chosen syringe scale (UI for U-100/U-40, mL for mL syringe) */
  syringeScaleValue: number;
  /** Equivalent U-100 units for universal reference */
  u100Units: number;
  /** Pure unesterified testosterone delivered per injection */
  baseTestPerInjectionMg: number;
  /** Pure unesterified testosterone delivered per week */
  baseTestWeeklyMg: number;
  /** Dead space volume lost per injection (mL) */
  deadSpaceLossMl: number;
  /** Total volume consumed from vial per shot (dose + dead space) */
  totalVialConsumedPerShotMl: number;
  /** Total usable doses in the vial */
  dosesPerVial: number;
  /** Total days the vial lasts */
  vialDurationDays: number;
  /** Total weeks the vial lasts */
  vialDurationWeeks: number;
  /** Fill percentage of the chosen syringe (0-100+) */
  fillPercent: number;
  isOverflow: boolean;
  isMicroDoseWarning: boolean;
  recommendedSyringeId: SyringeId;
}

export interface PKPoint {
  day: number;
  activeLevelMgPerDay: number;
  relativePercent: number;
}

export interface PKSummary {
  series: PKPoint[];
  comparisonSeries: PKPoint[];
  steadyPeak: number;
  steadyTrough: number;
  steadyMean: number;
  fluctuationPercent: number;
  injectionDays: number[];
}

export interface PeptideInput {
  mode: 'peptide_mg' | 'hcg_iu';
  vialTotalAmount: number;
  diluentMl: number;
  desiredDose: number;
  syringeId: SyringeId;
}

export interface PeptideResult {
  concentrationPerMl: number;
  volumeMl: number;
  syringeScaleValue: number;
  u100Units: number;
  dosesPerVial: number;
  fillPercent: number;
  isOverflow: boolean;
}

export interface SavedProtocol {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  input: TRTInput;
}
