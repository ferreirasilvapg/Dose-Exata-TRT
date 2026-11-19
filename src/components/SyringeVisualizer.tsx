import React, {useRef} from 'react';
import {Minus, Plus, ZoomIn} from 'lucide-react';
import {SYRINGES} from '../data/pharmacology';
import type {Dictionary, Language} from '../i18n/translations';
import type {SyringeId} from '../types/calculator';

interface SyringeVisualizerProps {
  syringeId: SyringeId;
  volumeMl: number;
  syringeScaleValue: number;
  isOverflow: boolean;
  t: Dictionary;
  lang: Language;
  interactive?: boolean;
  onReadingChange?: (newScaleValue: number) => void;
}

export const SyringeVisualizer: React.FC<SyringeVisualizerProps> = ({
  syringeId,
  volumeMl,
  syringeScaleValue,
  isOverflow,
  t,
  lang,
  interactive = false,
  onReadingChange,
}) => {
  const syringe = SYRINGES[syringeId];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  // SVG coordinate constants for main barrel
  const viewWidth = 760;
  const viewHeight = 164;
  const zeroX = 140;
  const maxX = 600;
  const barrelLength = maxX - zeroX; // 460px
  const barrelTop = 36;
  const barrelHeight = 64;
  const barrelBottom = barrelTop + barrelHeight;

  const clampedRatio = Math.max(0, Math.min(1, volumeMl / syringe.maxMl));
  const targetX = zeroX + clampedRatio * barrelLength;

  // Build exact tick marks matching the physical syringe
  const totalSteps = Math.round(syringe.maxScaleValue / syringe.minorStep);
  const ticks: Array<{
    value: number;
    x: number;
    isMajor: boolean;
    isMid: boolean;
  }> = [];

  for (let i = 0; i <= totalSteps; i++) {
    const value = Number((i * syringe.minorStep).toFixed(4));
    const ratio = value / syringe.maxScaleValue;
    const x = zeroX + ratio * barrelLength;
    const isMajor = Math.abs(value % syringe.majorStep) < 1e-4 || Math.abs((value % syringe.majorStep) - syringe.majorStep) < 1e-4;
    const midStep = syringe.majorStep / 2;
    const isMid =
      !isMajor &&
      syringe.minorStep < midStep &&
      (Math.abs(value % midStep) < 1e-4 || Math.abs((value % midStep) - midStep) < 1e-4);
    ticks.push({value, x, isMajor, isMid});
  }

  // Interactive drag handler
  const updateFromClientX = (clientX: number) => {
    if (!interactive || !onReadingChange || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * viewWidth;
    const ratio = Math.max(0, Math.min(1, (svgX - zeroX) / barrelLength));
    const rawVal = ratio * syringe.maxScaleValue;
    // Snap to half-minorStep for smooth yet exact control
    const snapStep = syringe.minorStep >= 1 ? 0.5 : syringe.minorStep;
    const snapped = Math.round(rawVal / snapStep) * snapStep;
    onReadingChange(Number(snapped.toFixed(2)));
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !draggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const formatTickLabel = (val: number) => {
    if (syringe.scaleType === 'mL') {
      return Number.isInteger(val) ? val.toFixed(0) : val.toFixed(1);
    }
    return String(Math.round(val));
  };

  const formattedReading =
    syringe.scaleType === 'mL'
      ? syringeScaleValue.toFixed(2)
      : syringeScaleValue.toFixed(syringe.minorStep < 1 ? 1 : 1).replace(/\.0$/, '');

  const unitLabel = syringe.scaleType === 'mL' ? 'mL' : 'UI';

  // Magnifier loupe window (shows +-18% of barrel centered around targetX, clamped inside barrel)
  const loupeSpanRatio = 0.24;
  const loupeCenterRatio = Math.max(
    loupeSpanRatio / 2,
    Math.min(1 - loupeSpanRatio / 2, clampedRatio)
  );
  const loupeMinRatio = loupeCenterRatio - loupeSpanRatio / 2;
  const loupeMaxRatio = loupeCenterRatio + loupeSpanRatio / 2;
  const loupeWidth = 340;
  const loupeHeight = 76;
  const loupeTargetX =
    ((clampedRatio - loupeMinRatio) / (loupeMaxRatio - loupeMinRatio)) * loupeWidth;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t.syringe.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pt' ? syringe.labelPt : syringe.labelEn}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
          <span className="text-slate-500 dark:text-slate-400">
            {t.syringe.capacity}: {syringe.maxScaleValue} {unitLabel} ({syringe.maxMl} mL)
          </span>
        </div>
      </div>

      {/* Main Vector Syringe Diagram */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-[#0B0E17]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className={`w-full select-none ${interactive ? 'cursor-ew-resize touch-none' : ''}`}
          role="img"
          aria-label={`${syringe.shortLabel}: ${formattedReading} ${unitLabel}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            <linearGradient id="barrelGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#F1F5F9" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#E2E8F0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="liquidFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isOverflow ? '#F43F5E' : '#38BDF8'} stopOpacity="0.92" />
              <stop offset="50%" stopColor={isOverflow ? '#E11D48' : '#0284C7'} stopOpacity="0.85" />
              <stop offset="100%" stopColor={isOverflow ? '#BE123C' : '#0369A1'} stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="rubberStopper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="45%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Needle Cannula (left) */}
          <line
            x1="14"
            y1={barrelTop + barrelHeight / 2}
            x2="86"
            y2={barrelTop + barrelHeight / 2}
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Bevel tip */}
          <polygon points="10,68 18,66 18,70" fill="#64748B" />

          {/* Needle Hub */}
          <path
            d={`M84,${barrelTop + 21} L112,${barrelTop + 17} L112,${barrelBottom - 17} L84,${barrelBottom - 21} Z`}
            fill={isOverflow ? '#E11D48' : '#0284C7'}
          />
          <rect
            x="112"
            y={barrelTop + 12}
            width="14"
            height={barrelHeight - 24}
            rx="2"
            fill="#CBD5E1"
            stroke="#64748B"
            strokeWidth="1"
          />

          {/* Zero Shoulder / Cone */}
          <path
            d={`M126,${barrelTop + 8} L${zeroX},${barrelTop} L${zeroX},${barrelBottom} L126,${barrelBottom - 8} Z`}
            fill="url(#barrelGlass)"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Plunger Rod extending right from stopper */}
          <rect
            x={targetX + 20}
            y={barrelTop + barrelHeight / 2 - 7}
            width={Math.max(40, 725 - (targetX + 20))}
            height="14"
            rx="2"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          {/* Plunger inner cross rib */}
          <line
            x1={targetX + 24}
            y1={barrelTop + barrelHeight / 2}
            x2={722}
            y2={barrelTop + barrelHeight / 2}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          {/* Thumb Flange (right end) */}
          <rect
            x="722"
            y={barrelTop + 4}
            width="14"
            height={barrelHeight - 8}
            rx="4"
            fill="#E2E8F0"
            stroke="#64748B"
            strokeWidth="1.5"
          />

          {/* Main Barrel Outer Cylinder */}
          <rect
            x={zeroX}
            y={barrelTop}
            width={barrelLength + 34}
            height={barrelHeight}
            rx="3"
            fill="url(#barrelGlass)"
            stroke="#64748B"
            strokeWidth="1.5"
          />

          {/* Finger Flange */}
          <rect
            x={maxX + 26}
            y={barrelTop - 16}
            width="12"
            height={barrelHeight + 32}
            rx="4"
            fill="#E2E8F0"
            stroke="#64748B"
            strokeWidth="1.5"
          />

          {/* Aspirated Medication Liquid */}
          {clampedRatio > 0 && (
            <rect
              x={zeroX}
              y={barrelTop + 4}
              width={Math.max(2, targetX - zeroX)}
              height={barrelHeight - 8}
              fill="url(#liquidFill)"
            />
          )}

          {/* Rubber Plunger Stopper (Leading edge aligned exactly at targetX) */}
          <g transform={`translate(${targetX}, 0)`}>
            {/* Leading sealing ring (this is the exact reading edge!) */}
            <rect
              x="0"
              y={barrelTop + 3}
              width="7"
              height={barrelHeight - 6}
              rx="1.5"
              fill="url(#rubberStopper)"
            />
            {/* Waist */}
            <rect
              x="7"
              y={barrelTop + 7}
              width="7"
              height={barrelHeight - 14}
              fill="#1E293B"
            />
            {/* Trailing sealing ring */}
            <rect
              x="14"
              y={barrelTop + 3}
              width="7"
              height={barrelHeight - 6}
              rx="1.5"
              fill="url(#rubberStopper)"
            />
          </g>

          {/* Precision Graduation Scale Ticks */}
          {ticks.map((tick, idx) => {
            const tickTop = barrelTop + 2;
            const tickLen = tick.isMajor ? 22 : tick.isMid ? 15 : 9;
            return (
              <g key={idx}>
                <line
                  x1={tick.x}
                  y1={tickTop}
                  x2={tick.x}
                  y2={tickTop + tickLen}
                  stroke="#0F172A"
                  strokeWidth={tick.isMajor ? '1.6' : '0.9'}
                  strokeOpacity={tick.isMajor ? '0.9' : '0.6'}
                />
                {tick.isMajor && (
                  <text
                    x={tick.x}
                    y={barrelBottom + 20}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-300"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {formatTickLabel(tick.value)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Target Indicator Laser Line & Flag */}
          <line
            x1={targetX}
            y1={barrelTop - 14}
            x2={targetX}
            y2={barrelBottom + 4}
            stroke={isOverflow ? '#E11D48' : '#0284C7'}
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <g transform={`translate(${Math.min(maxX - 10, Math.max(zeroX + 10, targetX))}, 14)`}>
            <rect
              x="-42"
              y="-11"
              width="84"
              height="20"
              rx="5"
              fill={isOverflow ? '#E11D48' : '#0284C7'}
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {isOverflow ? `>${syringe.maxScaleValue}` : formattedReading} {unitLabel}
            </text>
          </g>

          {/* Scale badge inside right side of barrel */}
          <text
            x={maxX + 16}
            y={barrelBottom + 20}
            textAnchor="end"
            className="fill-slate-500 dark:fill-slate-400"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {syringe.scaleType}
          </text>
        </svg>
      </div>

      {/* 3x Precision Loupe + Meniscus Alignment Guide */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-7 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <ZoomIn className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              {t.syringe.zoomTitle}
            </span>
            <span className="font-mono text-xs font-semibold text-sky-700 tabular-nums dark:text-sky-400">
              {formattedReading} {unitLabel} · {volumeMl.toFixed(3)} mL
            </span>
          </div>

          <svg
            viewBox={`0 0 ${loupeWidth} ${loupeHeight}`}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#07090E]"
            aria-hidden="true"
          >
            {/* Magnified fluid */}
            <rect
              x="0"
              y="14"
              width={Math.max(0, loupeTargetX)}
              height="34"
              fill={isOverflow ? '#E11D48' : '#0284C7'}
              fillOpacity="0.22"
            />
            {/* Magnified rubber stopper leading edge */}
            <rect
              x={loupeTargetX}
              y="14"
              width="28"
              height="34"
              rx="2"
              fill="#0F172A"
              className="dark:fill-slate-200"
            />
            <rect
              x={loupeTargetX}
              y="14"
              width="3"
              height="34"
              fill={isOverflow ? '#E11D48' : '#0284C7'}
            />

            {/* Magnified ticks inside the loupe window */}
            {ticks.map((tick, idx) => {
              const r = tick.value / syringe.maxScaleValue;
              if (r < loupeMinRatio - 0.01 || r > loupeMaxRatio + 0.01) return null;
              const lx = ((r - loupeMinRatio) / (loupeMaxRatio - loupeMinRatio)) * loupeWidth;
              return (
                <g key={idx}>
                  <line
                    x1={lx}
                    y1="14"
                    x2={lx}
                    y2={tick.isMajor ? 34 : tick.isMid ? 27 : 22}
                    stroke="currentColor"
                    className="text-slate-800 dark:text-slate-200"
                    strokeWidth={tick.isMajor ? '2' : '1.1'}
                  />
                  {(tick.isMajor || tick.isMid) && (
                    <text
                      x={lx}
                      y="64"
                      textAnchor="middle"
                      className="fill-slate-600 dark:fill-slate-400"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: tick.isMajor ? '11px' : '9px',
                        fontWeight: tick.isMajor ? 700 : 500,
                      }}
                    >
                      {syringe.scaleType === 'mL'
                        ? tick.value.toFixed(1)
                        : Number.isInteger(tick.value)
                          ? tick.value
                          : tick.value.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Target alignment needle-line */}
            <line
              x1={loupeTargetX}
              y1="4"
              x2={loupeTargetX}
              y2="52"
              stroke={isOverflow ? '#E11D48' : '#0284C7'}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Reading Instruction / Interactive Stepper */}
        <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 sm:col-span-5 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {interactive ? t.syringe.dragHint : t.syringe.meniscusHint}
          </p>

          {interactive && onReadingChange ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onReadingChange(
                    Math.max(0, Number((syringeScaleValue - syringe.minorStep).toFixed(2)))
                  )
                }
                aria-label="Diminuir leitura"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {formattedReading} {unitLabel}
              </div>
              <button
                type="button"
                onClick={() =>
                  onReadingChange(
                    Math.min(
                      syringe.maxScaleValue,
                      Number((syringeScaleValue + syringe.minorStep).toFixed(2))
                    )
                  )
                }
                aria-label="Aumentar leitura"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
              {lang === 'pt' ? syringe.needleNotePt : syringe.needleNoteEn}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
