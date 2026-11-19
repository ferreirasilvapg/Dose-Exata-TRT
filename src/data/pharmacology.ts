import type {EsterId, EsterSpec, FrequencyPreset, SyringeId, SyringeSpec} from '../types/calculator';

/**
 * Molecular Weight Reference:
 * Unesterified Testosterone Base = 288.42 g/mol
 * Cipionate (C27H40O3) = 412.61 g/mol -> 288.42 / 412.61 = 0.6990
 * Enanthate (C26H40O3) = 400.60 g/mol -> 288.42 / 400.60 = 0.7200
 * Propionate (C22H32O3) = 344.49 g/mol -> 288.42 / 344.49 = 0.8372
 * Undecanoate (C30H48O3) = 456.70 g/mol -> 288.42 / 456.70 = 0.6315
 * Sustanon / Durateston 250 mg/mL:
 *   - 30 mg Propionate (0.8372) = 25.12 mg base
 *   - 60 mg Phenylpropionate (288.42/420.59 = 0.6858) = 41.15 mg base
 *   - 60 mg Isocaproate (288.42/386.57 = 0.7461) = 44.77 mg base
 *   - 100 mg Decanoate (288.42/442.68 = 0.6515) = 65.15 mg base
 *   Total base = 176.19 mg / 250 mg = 0.7048
 */
export const ESTERS: Record<EsterId, EsterSpec> = {
  cypionate: {
    id: 'cypionate',
    namePt: 'Cipionato de Testosterona',
    nameEn: 'Testosterone Cypionate',
    shortName: 'Cipionato',
    baseFraction: 0.699,
    halfLifeDays: 8.0,
    absorptionHalfLifeDays: 1.0,
    examplesPt: 'Deposteron, Cipionato Manipulado',
    examplesEn: 'Depo-Testosterone, Test Cyp',
  },
  enanthate: {
    id: 'enanthate',
    namePt: 'Enantato de Testosterona',
    nameEn: 'Testosterone Enanthate',
    shortName: 'Enantato',
    baseFraction: 0.72,
    halfLifeDays: 4.5,
    absorptionHalfLifeDays: 0.7,
    examplesPt: 'Ciclo-6, Enantato Landerlan / Farmácia',
    examplesEn: 'Delatestryl, Xyosted, Test E',
  },
  sustanon: {
    id: 'sustanon',
    namePt: 'Durateston / Sustanon (4 Ésteres)',
    nameEn: 'Sustanon / Durateston (4-Ester Blend)',
    shortName: 'Durateston',
    baseFraction: 0.7048,
    halfLifeDays: 7.5,
    absorptionHalfLifeDays: 0.6,
    examplesPt: 'Durateston 250 mg/mL (Aspen/Organon)',
    examplesEn: 'Sustanon 250, Omnadren',
    blendComponents: [
      {fractionOfBlend: 30 / 250, baseFraction: 0.8372, halfLifeDays: 1.0, absorptionHalfLifeDays: 0.25},
      {fractionOfBlend: 60 / 250, baseFraction: 0.6858, halfLifeDays: 2.5, absorptionHalfLifeDays: 0.45},
      {fractionOfBlend: 60 / 250, baseFraction: 0.7461, halfLifeDays: 4.0, absorptionHalfLifeDays: 0.65},
      {fractionOfBlend: 100 / 250, baseFraction: 0.6515, halfLifeDays: 10.5, absorptionHalfLifeDays: 1.3},
    ],
  },
  propionate: {
    id: 'propionate',
    namePt: 'Propionato de Testosterona',
    nameEn: 'Testosterone Propionate',
    shortName: 'Propionato',
    baseFraction: 0.8372,
    halfLifeDays: 1.0,
    absorptionHalfLifeDays: 0.25,
    examplesPt: 'Propionato de ação rápida',
    examplesEn: 'Testoviron, Test Prop',
  },
  undecanoate: {
    id: 'undecanoate',
    namePt: 'Undecanoato de Testosterona',
    nameEn: 'Testosterone Undecanoate',
    shortName: 'Undecanoato',
    baseFraction: 0.6315,
    halfLifeDays: 21.0,
    absorptionHalfLifeDays: 2.5,
    examplesPt: 'Nebido, Hormus, Aveed',
    examplesEn: 'Nebido, Aveed',
  },
  base: {
    id: 'base',
    namePt: 'Testosterona Base (Sem Éster)',
    nameEn: 'Testosterone Base (Unesterified)',
    shortName: 'Base Livre',
    baseFraction: 1.0,
    halfLifeDays: 0.35,
    absorptionHalfLifeDays: 0.08,
    examplesPt: 'Suspensão aquosa / Referência 100%',
    examplesEn: 'Aqueous suspension / 100% pure base',
  },
};

export const SYRINGES: Record<SyringeId, SyringeSpec> = {
  u100_03: {
    id: 'u100_03',
    labelPt: '0,3 mL Insulina U-100 (30 UI)',
    labelEn: '0.3 mL U-100 Insulin (30 Units)',
    shortLabel: '0.3 mL (30 UI)',
    maxMl: 0.3,
    scaleType: 'U-100',
    unitsPerMl: 100,
    maxScaleValue: 30,
    minorStep: 0.5,
    majorStep: 5,
    typicalDeadSpaceMl: 0.003,
    needleNotePt: 'Ideal para microdoses diárias ou EOD (escala de 0,5 UI).',
    needleNoteEn: 'Best for daily or EOD microdosing (0.5 unit precision).',
  },
  u100_05: {
    id: 'u100_05',
    labelPt: '0,5 mL Insulina U-100 (50 UI)',
    labelEn: '0.5 mL U-100 Insulin (50 Units)',
    shortLabel: '0.5 mL (50 UI)',
    maxMl: 0.5,
    scaleType: 'U-100',
    unitsPerMl: 100,
    maxScaleValue: 50,
    minorStep: 1,
    majorStep: 10,
    typicalDeadSpaceMl: 0.005,
    needleNotePt: 'Padrão ouro para TRT subcutânea ou IM rasa (escala de 1 UI).',
    needleNoteEn: 'Gold standard for SubQ or shallow IM TRT (1 unit ticks).',
  },
  u100_10: {
    id: 'u100_10',
    labelPt: '1,0 mL Insulina U-100 (100 UI)',
    labelEn: '1.0 mL U-100 Insulin (100 Units)',
    shortLabel: '1.0 mL (100 UI)',
    maxMl: 1.0,
    scaleType: 'U-100',
    unitsPerMl: 100,
    maxScaleValue: 100,
    minorStep: 2,
    majorStep: 10,
    typicalDeadSpaceMl: 0.008,
    needleNotePt: 'Versátil até 1,0 mL; atenção às marcações de 2 em 2 UI.',
    needleNoteEn: 'Versatile up to 1.0 mL; note 2-unit minor tick increments.',
  },
  u40_10: {
    id: 'u40_10',
    labelPt: '1,0 mL Seringa U-40 (40 UI)',
    labelEn: '1.0 mL U-40 Syringe (40 Units)',
    shortLabel: '1.0 mL (U-40)',
    maxMl: 1.0,
    scaleType: 'U-40',
    unitsPerMl: 40,
    maxScaleValue: 40,
    minorStep: 1,
    majorStep: 5,
    typicalDeadSpaceMl: 0.01,
    needleNotePt: 'Escala U-40 (40 UI = 1 mL). Nunca confunda com U-100!',
    needleNoteEn: 'U-40 scale (40 Units = 1 mL). Do not confuse with U-100!',
  },
  im_30: {
    id: 'im_30',
    labelPt: '3,0 mL Seringa Luer-Lock IM',
    labelEn: '3.0 mL Luer-Lock IM Syringe',
    shortLabel: '3.0 mL (IM)',
    maxMl: 3.0,
    scaleType: 'mL',
    unitsPerMl: 1,
    maxScaleValue: 3.0,
    minorStep: 0.1,
    majorStep: 0.5,
    typicalDeadSpaceMl: 0.075,
    needleNotePt: 'Seringa IM tradicional; maior perda no canhão (~0,075 mL).',
    needleNoteEn: 'Standard IM syringe; higher hub dead-space loss (~0.075 mL).',
  },
};

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  {id: 'ed', labelPt: 'Todo dia (ED)', labelEn: 'Every Day (ED)', shortLabel: 'ED (1d)', intervalDays: 1},
  {id: 'eod', labelPt: 'Dia sim, dia não (EOD)', labelEn: 'Every Other Day (EOD)', shortLabel: 'EOD (2d)', intervalDays: 2},
  {id: '3xw', labelPt: '3x por semana (Seg/Qua/Sex)', labelEn: '3x / week (Mon/Wed/Fri)', shortLabel: '3x/sem', intervalDays: 7 / 3},
  {id: 'e3d', labelPt: 'A cada 3 dias (E3D)', labelEn: 'Every 3 Days (E3D)', shortLabel: 'E3D (3d)', intervalDays: 3},
  {id: 'e35d', labelPt: '2x por semana (E3.5D)', labelEn: 'Twice Weekly (E3.5D)', shortLabel: '2x/sem', intervalDays: 3.5},
  {id: 'e4d', labelPt: 'A cada 4 dias (E4D)', labelEn: 'Every 4 Days (E4D)', shortLabel: 'E4D (4d)', intervalDays: 4},
  {id: 'e5d', labelPt: 'A cada 5 dias (E5D)', labelEn: 'Every 5 Days (E5D)', shortLabel: 'E5D (5d)', intervalDays: 5},
  {id: 'qw', labelPt: '1x por semana (7 dias)', labelEn: 'Once Weekly (7 days)', shortLabel: '1x/sem', intervalDays: 7},
  {id: 'e14d', labelPt: 'A cada 14 dias', labelEn: 'Every 14 Days', shortLabel: '14d', intervalDays: 14},
];

export const CONCENTRATION_PRESETS = [
  {value: 100, label: '100 mg/mL', notePt: 'Deposteron 200mg/2mL', noteEn: '100 mg/mL standard'},
  {value: 200, label: '200 mg/mL', notePt: 'Cipionato EUA / 10mL', noteEn: 'US Cypionate standard'},
  {value: 250, label: '250 mg/mL', notePt: 'Durateston / Enantato', noteEn: 'Sustanon / Enanthate'},
  {value: 300, label: '300 mg/mL', notePt: 'Alta concentração', noteEn: 'High concentration'},
];
