import React, {useMemo, useState} from 'react';
import {CONCENTRATION_PRESETS, ESTERS, FREQUENCY_PRESETS, SYRINGES} from '../data/pharmacology';
import type {Dictionary, Language} from '../i18n/translations';
import type {EsterId, SyringeId} from '../types/calculator';
import {calculateReverse} from '../utils/calculations';
import {SyringeVisualizer} from './SyringeVisualizer';

interface ReverseCalculatorViewProps {
  t: Dictionary;
  lang: Language;
  defaultConcentration: number;
  defaultEster: EsterId;
  defaultInterval: number;
}

export const ReverseCalculatorView: React.FC<ReverseCalculatorViewProps> = ({
  t,
  lang,
  defaultConcentration,
  defaultEster,
  defaultInterval,
}) => {
  const [syringeId, setSyringeId] = useState<SyringeId>('u100_05');
  const [syringeReading, setSyringeReading] = useState<number>(25);
  const [concentration, setConcentration] = useState<number>(defaultConcentration);
  const [intervalDays, setIntervalDays] = useState<number>(defaultInterval);
  const [esterId, setEsterId] = useState<EsterId>(defaultEster);

  const selectedSyringe = SYRINGES[syringeId];
  const unitLabel = selectedSyringe.scaleType === 'mL' ? 'mL' : 'UI';

  const result = useMemo(
    () =>
      calculateReverse({
        syringeId,
        syringeReading,
        concentrationMgPerMl: concentration,
        intervalDays,
        esterId,
      }),
    [syringeId, syringeReading, concentration, intervalDays, esterId]
  );

  const handleSyringeSwitch = (nextId: SyringeId) => {
    const nextSyringe = SYRINGES[nextId];
    // Preserve current mL volume clamped to new syringe capacity
    const clampedMl = Math.min(result.volumeMl, nextSyringe.maxMl);
    const nextReading = Number((clampedMl * nextSyringe.unitsPerMl).toFixed(2));
    setSyringeId(nextId);
    setSyringeReading(nextReading);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      {/* Left Controls */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {t.reverse.title}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t.reverse.subtitle}
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="rev-syringe"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.trt.syringeType}
            </label>
            <select
              id="rev-syringe"
              value={syringeId}
              onChange={(e) => handleSyringeSwitch(e.target.value as SyringeId)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {Object.values(SYRINGES).map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'pt' ? s.labelPt : s.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="rev-reading"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.reverse.syringeReading} ({unitLabel})
              </label>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                = {result.volumeMl.toFixed(3)} mL
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="rev-reading"
                type="number"
                min="0"
                max={selectedSyringe.maxScaleValue}
                step={selectedSyringe.minorStep}
                value={syringeReading}
                onChange={(e) =>
                  setSyringeReading(
                    Math.max(
                      0,
                      Math.min(selectedSyringe.maxScaleValue, Number(e.target.value) || 0)
                    )
                  )
                }
                className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <span className="font-mono text-sm font-semibold text-slate-500">
                {unitLabel}
              </span>
            </div>
            <input
              type="range"
              aria-label={t.reverse.syringeReading}
              min="0"
              max={selectedSyringe.maxScaleValue}
              step={selectedSyringe.minorStep}
              value={syringeReading}
              onChange={(e) => setSyringeReading(Number(e.target.value))}
              className="precision-slider mt-3 w-full"
            />
          </div>

          <div>
            <label
              htmlFor="rev-conc"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.trt.concentration}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="rev-conc"
                type="number"
                min="1"
                max="1000"
                value={concentration}
                onChange={(e) => setConcentration(Math.max(1, Number(e.target.value)))}
                className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <span className="font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">
                mg/mL
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {CONCENTRATION_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={lang === 'pt' ? c.notePt : c.noteEn}
                  onClick={() => setConcentration(c.value)}
                  className={`min-h-[40px] rounded-lg border px-2 py-1 font-mono text-xs font-medium whitespace-nowrap tabular-nums transition-colors ${
                    concentration === c.value
                      ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="rev-freq"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.trt.frequency}
              </label>
              <select
                id="rev-freq"
                value={
                  FREQUENCY_PRESETS.find(
                    (f) => Math.abs(f.intervalDays - intervalDays) < 0.01
                  )?.id ?? 'e35d'
                }
                onChange={(e) => {
                  const found = FREQUENCY_PRESETS.find((f) => f.id === e.target.value);
                  if (found) setIntervalDays(found.intervalDays);
                }}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {FREQUENCY_PRESETS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {lang === 'pt' ? f.labelPt : f.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rev-ester"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.trt.ester}
              </label>
              <select
                id="rev-ester"
                value={esterId}
                onChange={(e) => setEsterId(e.target.value as EsterId)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {Object.values(ESTERS).map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Right Interactive Result & Draggable Syringe */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-5 sm:grid-cols-4 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.trt.results.perShotMg}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-sky-700 tabular-nums dark:text-sky-400">
              {result.dosePerInjectionMg.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-slate-500">mg</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.trt.results.weeklyMg}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-100">
              {result.weeklyDoseMg.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-slate-500">mg</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.trt.results.baseTest}
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
              {result.baseTestWeeklyMg.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-slate-500">mg/sem</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.trt.results.volumeLabel}
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-slate-100">
              {result.volumeMl.toFixed(3)}
              <span className="ml-1 text-xs font-normal text-slate-500">mL</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <SyringeVisualizer
            syringeId={syringeId}
            volumeMl={result.volumeMl}
            syringeScaleValue={syringeReading}
            isOverflow={result.isOverflow}
            t={t}
            lang={lang}
            interactive={true}
            onReadingChange={setSyringeReading}
          />
        </div>
      </section>
    </div>
  );
};
