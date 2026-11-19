import React, {useMemo, useState} from 'react';
import {ESTERS} from '../data/pharmacology';
import type {Dictionary, Language} from '../i18n/translations';
import type {EsterId} from '../types/calculator';
import {simulatePharmacokinetics} from '../utils/calculations';

interface PharmacokineticChartProps {
  esterId: EsterId;
  weeklyDoseMg: number;
  intervalDays: number;
  t: Dictionary;
  lang: Language;
}

export const PharmacokineticChart: React.FC<PharmacokineticChartProps> = ({
  esterId,
  weeklyDoseMg,
  intervalDays,
  t,
  lang,
}) => {
  const [compareInterval, setCompareInterval] = useState<number | null>(7);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const summary = useMemo(
    () =>
      simulatePharmacokinetics(
        esterId,
        weeklyDoseMg,
        intervalDays,
        compareInterval ?? intervalDays
      ),
    [esterId, weeklyDoseMg, intervalDays, compareInterval]
  );

  const ester = ESTERS[esterId];
  const width = 760;
  const height = 240;
  const padLeft = 52;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxMg = useMemo(() => {
    const m1 = summary.series.reduce((m, p) => Math.max(m, p.activeLevelMgPerDay), 0);
    const m2 =
      compareInterval !== null
        ? summary.comparisonSeries.reduce((m, p) => Math.max(m, p.activeLevelMgPerDay), 0)
        : 0;
    return Math.max(m1, m2, 1) * 1.12;
  }, [summary, compareInterval]);

  const toX = (day: number) => padLeft + (day / 42) * plotW;
  const toY = (val: number) => padTop + plotH - (val / maxMg) * plotH;

  const primaryPath = summary.series
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.day).toFixed(1)},${toY(p.activeLevelMgPerDay).toFixed(1)}`)
    .join(' ');

  const areaPath = `${primaryPath} L${toX(42).toFixed(1)},${(padTop + plotH).toFixed(1)} L${padLeft},${(padTop + plotH).toFixed(1)} Z`;

  const comparePath =
    compareInterval !== null
      ? summary.comparisonSeries
          .map(
            (p, i) =>
              `${i === 0 ? 'M' : 'L'}${toX(p.day).toFixed(1)},${toY(p.activeLevelMgPerDay).toFixed(1)}`
          )
          .join(' ')
      : '';

  const hoveredPoint =
    hoverIdx !== null ? summary.series[hoverIdx] ?? null : null;
  const hoveredCompare =
    hoverIdx !== null && compareInterval !== null
      ? summary.comparisonSeries[hoverIdx] ?? null
      : null;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const dayRatio = Math.max(0, Math.min(1, (svgX - padLeft) / plotW));
    const idx = Math.round(dayRatio * (summary.series.length - 1));
    setHoverIdx(idx);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
            {t.pk.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {t.pk.subtitle} ({lang === 'pt' ? ester.namePt : ester.nameEn} · t½ ≈{' '}
            {ester.halfLifeDays}d)
          </p>
        </div>

        {/* Comparison Frequency Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">
            {t.pk.compareWith}
          </span>
          {[
            {val: null, label: t.pk.noCompare},
            {val: 7, label: t.pk.compare1x},
            {val: 3.5, label: t.pk.compare2x},
            {val: 2, label: t.pk.compareEod},
          ].map((opt) => {
            const active = compareInterval === opt.val;
            return (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => setCompareInterval(opt.val)}
                className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Column Precision PK Telemetry Strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.pk.steadyMean}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
            {summary.steadyMean.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-slate-500">mg/d</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.pk.steadyPeak}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-sky-700 tabular-nums dark:text-sky-400">
            {summary.steadyPeak.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-slate-500">mg/d</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.pk.steadyTrough}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
            {summary.steadyTrough.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-slate-500">mg/d</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.pk.fluctuation}
          </div>
          <div
            className={`mt-1 font-mono text-lg font-bold tabular-nums ${
              summary.fluctuationPercent <= 25
                ? 'text-emerald-700 dark:text-emerald-400'
                : summary.fluctuationPercent <= 55
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {summary.fluctuationPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Interactive SVG Curve */}
      <div className="relative mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-2 sm:p-3 dark:border-slate-800 dark:bg-[#07090E]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full cursor-crosshair select-none touch-pan-y"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="pkArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Y Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padTop + plotH * (1 - frac);
            const val = maxMg * frac;
            return (
              <g key={frac}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 dark:fill-slate-400"
                  style={{fontFamily: 'JetBrains Mono, monospace', fontSize: '10px'}}
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Vertical Week Markers */}
          {[0, 7, 14, 21, 28, 35, 42].map((day) => {
            const x = toX(day);
            return (
              <g key={day}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke="currentColor"
                  className="text-slate-200/70 dark:text-slate-800/70"
                  strokeDasharray="2 3"
                />
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400"
                  style={{fontFamily: 'JetBrains Mono, monospace', fontSize: '10px'}}
                >
                  D{day}
                </text>
              </g>
            );
          })}

          {/* Steady Mean Reference Line */}
          <line
            x1={padLeft}
            y1={toY(summary.steadyMean)}
            x2={width - padRight}
            y2={toY(summary.steadyMean)}
            stroke="#059669"
            strokeOpacity="0.45"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />

          {/* Comparison Curve (Dashed) */}
          {comparePath && (
            <path
              d={comparePath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.75"
              strokeDasharray="5 4"
            />
          )}

          {/* Primary Curve Fill & Stroke */}
          <path d={areaPath} fill="url(#pkArea)" />
          <path
            d={primaryPath}
            fill="none"
            stroke="#0284C7"
            className="dark:stroke-sky-400"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Injection Markers along bottom axis */}
          {summary.injectionDays.map((d) => (
            <circle
              key={d}
              cx={toX(d)}
              cy={padTop + plotH}
              r="2.5"
              className="fill-sky-600 dark:fill-sky-400"
            />
          ))}

          {/* Interactive Crosshair Probe */}
          {hoveredPoint && (
            <g>
              <line
                x1={toX(hoveredPoint.day)}
                y1={padTop}
                x2={toX(hoveredPoint.day)}
                y2={padTop + plotH}
                stroke="#64748B"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={toX(hoveredPoint.day)}
                cy={toY(hoveredPoint.activeLevelMgPerDay)}
                r="4.5"
                fill="#0284C7"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              {hoveredCompare && (
                <circle
                  cx={toX(hoveredCompare.day)}
                  cy={toY(hoveredCompare.activeLevelMgPerDay)}
                  r="3.5"
                  fill="#64748B"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}
        </svg>

        {/* Legend & Live Hover HUD */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-0.5 w-4 bg-sky-600 dark:bg-sky-400" />
              {t.pk.currentProtocol}
            </span>
            {compareInterval !== null && (
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" />
                {t.pk.comparisonCurve} ({compareInterval}d)
              </span>
            )}
          </div>

          <div className="font-mono text-xs text-slate-700 tabular-nums dark:text-slate-200">
            {hoveredPoint ? (
              <span>
                {t.pk.dayLabel} {hoveredPoint.day.toFixed(1)} ·{' '}
                <strong className="text-sky-700 dark:text-sky-400">
                  {hoveredPoint.activeLevelMgPerDay.toFixed(2)} {t.pk.mgPerDay}
                </strong>
                {hoveredCompare && (
                  <span className="text-slate-500 dark:text-slate-400">
                    {' '}
                    | Ref: {hoveredCompare.activeLevelMgPerDay.toFixed(2)}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                {lang === 'pt'
                  ? 'Passe o dedo/cursor no gráfico para leitura exata'
                  : 'Hover or scrub chart for daily values'}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
