import React, {useMemo, useState} from 'react';
import {AlertTriangle} from 'lucide-react';
import {SYRINGES} from '../data/pharmacology';
import {formatT, type Dictionary, type Language} from '../i18n/translations';
import type {PeptideInput, SyringeId} from '../types/calculator';
import {calculatePeptide} from '../utils/calculations';
import {SyringeVisualizer} from './SyringeVisualizer';

interface PeptideCalculatorViewProps {
  t: Dictionary;
  lang: Language;
}

export const PeptideCalculatorView: React.FC<PeptideCalculatorViewProps> = ({
  t,
  lang,
}) => {
  const [input, setInput] = useState<PeptideInput>({
    mode: 'hcg_iu',
    vialTotalAmount: 5000,
    diluentMl: 5,
    desiredDose: 250,
    syringeId: 'u100_05',
  });

  const result = useMemo(() => calculatePeptide(input), [input]);
  const selectedSyringe = SYRINGES[input.syringeId];
  const unitLabel = selectedSyringe.scaleType === 'mL' ? 'mL' : 'UI';
  const formattedScale =
    selectedSyringe.scaleType === 'mL'
      ? result.syringeScaleValue.toFixed(2)
      : result.syringeScaleValue.toFixed(1).replace(/\.0$/, '');

  const switchMode = (mode: PeptideInput['mode']) => {
    if (mode === 'peptide_mg') {
      setInput({
        mode: 'peptide_mg',
        vialTotalAmount: 5,
        diluentMl: 2,
        desiredDose: 250,
        syringeId: 'u100_03',
      });
    } else {
      setInput({
        mode: 'hcg_iu',
        vialTotalAmount: 5000,
        diluentMl: 5,
        desiredDose: 250,
        syringeId: 'u100_05',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {t.peptide.title}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t.peptide.subtitle}
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {/* Mode Switch */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => switchMode('hcg_iu')}
              className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                input.mode === 'hcg_iu'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t.peptide.modeHcg}
            </button>
            <button
              type="button"
              onClick={() => switchMode('peptide_mg')}
              className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                input.mode === 'peptide_mg'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t.peptide.modePeptide}
            </button>
          </div>

          {/* Vial Amount */}
          <div>
            <label
              htmlFor="pep-vial"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.peptide.vialAmount} ({input.mode === 'peptide_mg' ? 'mg' : 'UI'})
            </label>
            <input
              id="pep-vial"
              type="number"
              min="0.1"
              step={input.mode === 'peptide_mg' ? '0.5' : '500'}
              value={input.vialTotalAmount || ''}
              onChange={(e) =>
                setInput({
                  ...input,
                  vialTotalAmount: Math.max(0.1, Number(e.target.value)),
                })
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(input.mode === 'peptide_mg'
                ? [2, 5, 10, 15]
                : [2000, 5000, 10000]
              ).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInput({...input, vialTotalAmount: v})}
                  className={`min-h-[34px] rounded-lg border px-2.5 py-1 font-mono text-xs font-medium tabular-nums ${
                    input.vialTotalAmount === v
                      ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  {v} {input.mode === 'peptide_mg' ? 'mg' : 'UI'}
                </button>
              ))}
            </div>
          </div>

          {/* Diluent Water */}
          <div>
            <label
              htmlFor="pep-diluent"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.peptide.diluentAmount}
            </label>
            <input
              id="pep-diluent"
              type="number"
              min="0.5"
              max="30"
              step="0.5"
              value={input.diluentMl || ''}
              onChange={(e) =>
                setInput({
                  ...input,
                  diluentMl: Math.max(0.1, Number(e.target.value)),
                })
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 2, 2.5, 3, 5, 10].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInput({...input, diluentMl: v})}
                  className={`min-h-[34px] rounded-lg border px-2.5 py-1 font-mono text-xs font-medium tabular-nums ${
                    input.diluentMl === v
                      ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  {v} mL
                </button>
              ))}
            </div>
          </div>

          {/* Desired Dose */}
          <div>
            <label
              htmlFor="pep-dose"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.peptide.desiredDose} ({input.mode === 'peptide_mg' ? 'mcg' : 'UI'})
            </label>
            <input
              id="pep-dose"
              type="number"
              min="1"
              step={input.mode === 'peptide_mg' ? '25' : '50'}
              value={input.desiredDose || ''}
              onChange={(e) =>
                setInput({
                  ...input,
                  desiredDose: Math.max(0, Number(e.target.value)),
                })
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-base font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(input.mode === 'peptide_mg'
                ? [100, 250, 500, 1000]
                : [250, 500, 750, 1000]
              ).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInput({...input, desiredDose: v})}
                  className={`min-h-[34px] rounded-lg border px-2.5 py-1 font-mono text-xs font-medium tabular-nums ${
                    input.desiredDose === v
                      ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  {v} {input.mode === 'peptide_mg' ? 'mcg' : 'UI'}
                </button>
              ))}
            </div>
          </div>

          {/* Syringe Type */}
          <div>
            <label
              htmlFor="pep-syringe"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {t.trt.syringeType}
            </label>
            <select
              id="pep-syringe"
              value={input.syringeId}
              onChange={(e) =>
                setInput({...input, syringeId: e.target.value as SyringeId})
              }
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {Object.values(SYRINGES).map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'pt' ? s.labelPt : s.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Right Result */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {t.trt.results.drawTo}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className={`font-mono text-4xl font-bold tabular-nums sm:text-5xl ${
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
                ({result.volumeMl.toFixed(3)} mL)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-right">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.peptide.concentrationResult}
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {result.concentrationPerMl.toFixed(0)}{' '}
                {input.mode === 'peptide_mg' ? 'mcg/mL' : 'UI/mL'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.trt.results.vialDuration}
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {result.dosesPerVial} {lang === 'pt' ? 'doses' : 'doses'}
              </div>
            </div>
          </div>
        </div>

        {result.isOverflow && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-950 dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-100"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              {formatT(t.trt.results.overflowWarning, {
                max: selectedSyringe.maxMl,
              })}
            </span>
          </div>
        )}

        <div className="mt-5">
          <SyringeVisualizer
            syringeId={input.syringeId}
            volumeMl={result.volumeMl}
            syringeScaleValue={result.syringeScaleValue}
            isOverflow={result.isOverflow}
            t={t}
            lang={lang}
          />
        </div>
      </section>
    </div>
  );
};
