import React, {useState} from 'react';
import {
  AlertTriangle,
  BookmarkPlus,
  Calendar,
  Check,
  Copy,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  CONCENTRATION_PRESETS,
  ESTERS,
  FREQUENCY_PRESETS,
  SYRINGES,
} from '../data/pharmacology';
import {formatT, type Dictionary, type Language} from '../i18n/translations';
import type {EsterId, SyringeId, TRTInput, TRTResult} from '../types/calculator';
import {PharmacokineticChart} from './PharmacokineticChart';
import {SyringeVisualizer} from './SyringeVisualizer';

interface TRTCalculatorViewProps {
  input: TRTInput;
  result: TRTResult;
  onChange: (next: TRTInput) => void;
  onReset: () => void;
  onSaveProtocol: (name: string) => void;
  t: Dictionary;
  lang: Language;
}

export const TRTCalculatorView: React.FC<TRTCalculatorViewProps> = ({
  input,
  result,
  onChange,
  onReset,
  onSaveProtocol,
  t,
  lang,
}) => {
  const [showAmpouleCalc, setShowAmpouleCalc] = useState(false);
  const [ampouleMg, setAmpouleMg] = useState(200);
  const [ampouleMl, setAmpouleMl] = useState(2);
  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const selectedSyringe = SYRINGES[input.syringeId];
  const selectedEster = ESTERS[input.esterId];

  const isPresetFrequency = FREQUENCY_PRESETS.some(
    (f) => Math.abs(f.intervalDays - input.intervalDays) < 0.01
  );

  const unitLabel = selectedSyringe.scaleType === 'mL' ? 'mL' : 'UI';
  const formattedScale =
    selectedSyringe.scaleType === 'mL'
      ? result.syringeScaleValue.toFixed(2)
      : result.syringeScaleValue.toFixed(1).replace(/\.0$/, '');

  const handleCopySummary = async () => {
    const esterName = lang === 'pt' ? selectedEster.namePt : selectedEster.nameEn;
    const summaryText =
      lang === 'pt'
        ? `Protocolo TRT (${esterName}): ${result.weeklyDoseMg.toFixed(1)} mg/sem | ${result.dosePerInjectionMg.toFixed(1)} mg/aplicação (a cada ${Number(input.intervalDays.toFixed(2))} dias) | Concentração: ${input.concentrationMgPerMl} mg/mL | Aspirar: ${result.volumePerInjectionMl.toFixed(3)} mL (${formattedScale} ${unitLabel} na seringa ${selectedSyringe.shortLabel}) | Testosterona base ativa: ${result.baseTestWeeklyMg.toFixed(1)} mg/sem.`
        : `TRT Protocol (${esterName}): ${result.weeklyDoseMg.toFixed(1)} mg/wk | ${result.dosePerInjectionMg.toFixed(1)} mg/shot (every ${Number(input.intervalDays.toFixed(2))} days) | Concentration: ${input.concentrationMgPerMl} mg/mL | Draw: ${result.volumePerInjectionMl.toFixed(3)} mL (${formattedScale} ${unitLabel} on ${selectedSyringe.shortLabel}) | Active base testosterone: ${result.baseTestWeeklyMg.toFixed(1)} mg/wk.`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored silently
    }
  };

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultName =
      saveName.trim() ||
      `${selectedEster.shortName} ${Math.round(result.weeklyDoseMg)}mg/sem`;
    onSaveProtocol(defaultName);
    setSaveName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Asymmetric Split Console */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Control Column (5 cols on lg) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.trt.title}
            </h1>
            <button
              type="button"
              onClick={onReset}
              title={t.actions.reset}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap shrink-0 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.actions.reset}</span>
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {/* 1. Dose Input Mode + Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.trt.doseModeLabel}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...input,
                      doseInputMode: 'weekly',
                      doseMg: Number(result.weeklyDoseMg.toFixed(1)),
                    })
                  }
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    input.doseInputMode === 'weekly'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {t.trt.weeklyMode}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...input,
                      doseInputMode: 'per_injection',
                      doseMg: Number(result.dosePerInjectionMg.toFixed(1)),
                    })
                  }
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    input.doseInputMode === 'per_injection'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {t.trt.perShotMode}
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="trt-dose-input"
                    className="text-xs font-medium text-slate-600 dark:text-slate-400"
                  >
                    {input.doseInputMode === 'weekly'
                      ? t.trt.weeklyDose
                      : t.trt.perShotDose}
                  </label>
                  <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {input.doseInputMode === 'weekly'
                      ? `= ${result.dosePerInjectionMg.toFixed(1)} mg/dose`
                      : `= ${result.weeklyDoseMg.toFixed(1)} mg/sem`}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    id="trt-dose-input"
                    type="number"
                    min="1"
                    max="2000"
                    step="1"
                    value={input.doseMg || ''}
                    onChange={(e) =>
                      onChange({
                        ...input,
                        doseMg: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold text-slate-900 tabular-nums focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
                  />
                  <span className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-400">
                    mg
                  </span>
                </div>

                <input
                  type="range"
                  aria-label={t.trt.weeklyDose}
                  min={input.doseInputMode === 'weekly' ? 40 : 10}
                  max={input.doseInputMode === 'weekly' ? 350 : 250}
                  step={input.doseInputMode === 'weekly' ? 5 : 2.5}
                  value={Math.min(
                    input.doseInputMode === 'weekly' ? 350 : 250,
                    input.doseMg
                  )}
                  onChange={(e) =>
                    onChange({...input, doseMg: Number(e.target.value)})
                  }
                  className="precision-slider mt-3 w-full"
                />

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(input.doseInputMode === 'weekly'
                    ? [80, 100, 120, 140, 160, 200, 250, 300]
                    : [20, 40, 50, 75, 100, 125]
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChange({...input, doseMg: preset})}
                      className={`min-h-[34px] rounded-lg border px-2.5 py-1 font-mono text-xs font-medium tabular-nums transition-colors ${
                        Math.abs(input.doseMg - preset) < 0.01
                          ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset}mg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Frequency */}
            <div>
              <label
                htmlFor="trt-frequency"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.trt.frequency}
              </label>
              <select
                id="trt-frequency"
                value={
                  isPresetFrequency
                    ? FREQUENCY_PRESETS.find(
                        (f) => Math.abs(f.intervalDays - input.intervalDays) < 0.01
                      )?.id
                    : 'custom'
                }
                onChange={(e) => {
                  const found = FREQUENCY_PRESETS.find((f) => f.id === e.target.value);
                  if (found) {
                    onChange({...input, intervalDays: found.intervalDays});
                  } else {
                    onChange({...input, intervalDays: 3});
                  }
                }}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
              >
                {FREQUENCY_PRESETS.map((freq) => (
                  <option key={freq.id} value={freq.id}>
                    {lang === 'pt' ? freq.labelPt : freq.labelEn}
                  </option>
                ))}
                <option value="custom">{t.trt.customInterval}</option>
              </select>

              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.trt.customInterval}:
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    aria-label={t.trt.customInterval}
                    value={Number(input.intervalDays.toFixed(2))}
                    onChange={(e) =>
                      onChange({
                        ...input,
                        intervalDays: Math.max(0.5, Number(e.target.value) || 1),
                      })
                    }
                    className="min-h-[38px] w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-center font-mono text-sm font-semibold text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    d ({result.injectionsPerWeek.toFixed(2)}x/sem)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Ester Selection */}
            <div>
              <label
                htmlFor="trt-ester"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.trt.ester}
              </label>
              <select
                id="trt-ester"
                value={input.esterId}
                onChange={(e) =>
                  onChange({...input, esterId: e.target.value as EsterId})
                }
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
              >
                {Object.values(ESTERS).map((ester) => (
                  <option key={ester.id} value={ester.id}>
                    {lang === 'pt' ? ester.namePt : ester.nameEn} (
                    {(ester.baseFraction * 100).toFixed(1)}% base)
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'pt' ? selectedEster.examplesPt : selectedEster.examplesEn} · t½{' '}
                {selectedEster.halfLifeDays}d · {(selectedEster.baseFraction * 100).toFixed(1)}%{' '}
                {t.trt.esterBaseNote}
              </p>
            </div>

            {/* 4. Concentration + Ampoule Helper */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="trt-conc"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t.trt.concentration}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAmpouleCalc((v) => !v)}
                  className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
                >
                  {t.trt.ampouleHelper}
                </button>
              </div>

              {showAmpouleCalc && (
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <div>
                    <span className="block text-[10px] text-slate-500">
                      {t.trt.ampouleTotalMg}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={ampouleMg}
                      onChange={(e) => setAmpouleMg(Math.max(1, Number(e.target.value)))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">
                      {t.trt.ampouleTotalMl}
                    </span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={ampouleMl}
                      onChange={(e) => setAmpouleMl(Math.max(0.1, Number(e.target.value)))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        const calc = Number((ampouleMg / ampouleMl).toFixed(1));
                        onChange({
                          ...input,
                          concentrationMgPerMl: calc,
                          vialVolumeMl: ampouleMl,
                        });
                        setShowAmpouleCalc(false);
                      }}
                      className="min-h-[34px] w-full rounded-lg bg-sky-600 px-2 py-1.5 font-mono text-xs font-semibold text-white hover:bg-sky-700"
                    >
                      = {(ampouleMg / ampouleMl).toFixed(0)} mg/mL
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="trt-conc"
                  type="number"
                  min="1"
                  max="1000"
                  step="5"
                  value={input.concentrationMgPerMl || ''}
                  onChange={(e) =>
                    onChange({
                      ...input,
                      concentrationMgPerMl: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold text-slate-900 tabular-nums focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
                />
                <span className="font-mono text-xs font-semibold text-slate-500 whitespace-nowrap dark:text-slate-400">
                  mg/mL
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {CONCENTRATION_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={lang === 'pt' ? c.notePt : c.noteEn}
                    onClick={() =>
                      onChange({...input, concentrationMgPerMl: c.value})
                    }
                    className={`min-h-[40px] rounded-lg border px-2 py-1 font-mono text-xs font-medium whitespace-nowrap tabular-nums transition-colors ${
                      input.concentrationMgPerMl === c.value
                        ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Syringe Type */}
            <div>
              <label
                htmlFor="trt-syringe"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.trt.syringeType}
              </label>
              <select
                id="trt-syringe"
                value={input.syringeId}
                onChange={(e) =>
                  onChange({...input, syringeId: e.target.value as SyringeId})
                }
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
              >
                {Object.values(SYRINGES).map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === 'pt' ? s.labelPt : s.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Vial Volume & Dead Space */}
            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
              <div>
                <label
                  htmlFor="trt-vial"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  {t.trt.vialSize} (mL)
                </label>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    id="trt-vial"
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={input.vialVolumeMl || ''}
                    onChange={(e) =>
                      onChange({
                        ...input,
                        vialVolumeMl: Math.max(0.5, Number(e.target.value)),
                      })
                    }
                    className="min-h-[42px] w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {[2, 4, 10].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onChange({...input, vialVolumeMl: v})}
                      className={`min-h-[42px] rounded-lg border px-2 font-mono text-xs tabular-nums ${
                        input.vialVolumeMl === v
                          ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex min-h-[42px] cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <input
                    type="checkbox"
                    checked={input.includeDeadSpace}
                    onChange={(e) =>
                      onChange({...input, includeDeadSpace: e.target.checked})
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                  />
                  <div>
                    <span className="block text-xs font-medium text-slate-800 dark:text-slate-200">
                      {t.trt.deadSpaceToggle}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                      {input.includeDeadSpace
                        ? `+${selectedSyringe.typicalDeadSpaceMl.toFixed(3)} mL/dose`
                        : '0.000 mL'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Right Live Output & Syringe Stage (7 cols on lg) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Primary Quantitative Telemetry Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  {t.trt.results.drawTo}
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span
                    className={`font-mono text-4xl font-bold tracking-tight tabular-nums sm:text-5xl ${
                      result.isOverflow
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-sky-700 dark:text-sky-400'
                    }`}
                  >
                    {formattedScale}
                  </span>
                  <span className="font-mono text-lg font-semibold text-slate-600 dark:text-slate-300">
                    {unitLabel}
                  </span>
                  <span className="font-mono text-sm text-slate-500 tabular-nums dark:text-slate-400">
                    ({result.volumePerInjectionMl.toFixed(3)} mL)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copied ? t.actions.copied : t.actions.copySummary}</span>
                </button>
              </div>
            </div>

            {/* Safety / Precision Alerts (Text + Icon, never hue-only) */}
            {result.isOverflow && (
              <div
                role="alert"
                className="mt-4 flex flex-col gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-rose-950 sm:flex-row sm:items-center sm:justify-between dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-100"
              >
                <div className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>
                    {formatT(t.trt.results.overflowWarning, {
                      max: selectedSyringe.maxMl,
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange({...input, syringeId: result.recommendedSyringeId})
                  }
                  className="min-h-[38px] shrink-0 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 whitespace-nowrap"
                >
                  {t.trt.results.switchRecommended} (
                  {SYRINGES[result.recommendedSyringeId].shortLabel})
                </button>
              </div>
            )}

            {!result.isOverflow && result.isMicroDoseWarning && (
              <div
                role="status"
                className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100"
              >
                <div className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span>
                    {formatT(t.trt.results.microDoseWarning, {
                      step: `${selectedSyringe.minorStep} ${unitLabel}`,
                    })}
                  </span>
                </div>
                {input.syringeId !== 'u100_03' && (
                  <button
                    type="button"
                    onClick={() => onChange({...input, syringeId: 'u100_03'})}
                    className="min-h-[38px] shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 whitespace-nowrap"
                  >
                    0.3 mL (30 UI)
                  </button>
                )}
              </div>
            )}

            {selectedSyringe.scaleType === 'U-40' && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                <span>{t.trt.results.u40Warning}</span>
              </div>
            )}

            {/* 4-Column Exact Metric Strip */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {t.trt.results.perShotMg}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                  {result.dosePerInjectionMg.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-slate-500">mg</span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                  U-100: {result.u100Units.toFixed(1)} UI
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {t.trt.results.weeklyMg}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                  {result.weeklyDoseMg.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-slate-500">mg</span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                  {result.weeklyVolumeMl.toFixed(2)} mL/sem
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {t.trt.results.baseTest}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
                  {result.baseTestWeeklyMg.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-slate-500">mg/sem</span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                  {result.baseTestPerInjectionMg.toFixed(1)} mg/dose
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {t.trt.results.vialDuration}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                  {result.dosesPerVial}
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    {lang === 'pt' ? 'doses' : 'shots'}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                  {formatT(t.trt.results.daysAndWeeks, {
                    days: Math.round(result.vialDurationDays),
                    weeks: result.vialDurationWeeks.toFixed(1),
                  })}
                </div>
              </div>
            </div>

            {/* Interactive SVG Syringe + 3x Magnifier */}
            <div className="mt-6">
              <SyringeVisualizer
                syringeId={input.syringeId}
                volumeMl={result.volumePerInjectionMl}
                syringeScaleValue={result.syringeScaleValue}
                isOverflow={result.isOverflow}
                t={t}
                lang={lang}
              />
            </div>

            {/* Quick Save Protocol Bar */}
            <form
              onSubmit={handleQuickSave}
              className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center dark:border-slate-800"
            >
              <div className="flex flex-1 items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={t.protocols.protocolNamePlaceholder}
                  className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                {justSaved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
                <span>{justSaved ? t.actions.saved : t.actions.saveProtocol}</span>
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Full-Width Pharmacokinetic Curve Section */}
      <PharmacokineticChart
        esterId={input.esterId}
        weeklyDoseMg={result.weeklyDoseMg}
        intervalDays={input.intervalDays}
        t={t}
        lang={lang}
      />
    </div>
  );
};
