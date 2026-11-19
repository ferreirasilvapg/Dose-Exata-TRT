import React, {useState} from 'react';
import {Syringe} from 'lucide-react';
import type {Dictionary, Language} from '../i18n/translations';

interface HeroCoverProps {
  t: Dictionary;
  lang: Language;
  weeklyDoseMg: number;
  syringeScaleValue: number;
  syringeUnit: string;
  volumeMl: number;
}

export const HeroCover: React.FC<HeroCoverProps> = ({
  t,
  lang,
  weeklyDoseMg,
  syringeScaleValue,
  syringeUnit,
  volumeMl,
}) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const [emblemFailed, setEmblemFailed] = useState(false);

  const formattedScale =
    syringeUnit === 'mL'
      ? syringeScaleValue.toFixed(2)
      : syringeScaleValue.toFixed(1).replace(/\.0$/, '');

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0B0E17] text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Brand Emblem, Editorial Headline & Unboxed Telemetry Specs */}
        <div className="relative z-10 flex flex-col justify-between p-5 sm:p-7 lg:col-span-7">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-sky-500/30 bg-[#07090E]">
                {!emblemFailed ? (
                  <img
                    src="/src/assets/images/app_brand_emblem_1795105035506.jpg"
                    alt="DoseExata"
                    referrerPolicy="no-referrer"
                    onError={() => setEmblemFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-sky-950/60 text-sky-400">
                    <Syringe className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-sky-400">
                  {lang === 'pt'
                    ? 'Instrumento Clínico de Dosagem'
                    : 'Clinical Dosing Instrument'}
                </p>
                <h2 className="font-display mt-0.5 text-xl font-bold tracking-tight text-white text-balance sm:text-2xl">
                  {lang === 'pt'
                    ? 'Precisão milimétrica para protocolos de TRT e Peptídeos'
                    : 'Millimetric precision for TRT and Peptide protocols'}
                </h2>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              {t.trt.subtitle}
            </p>
          </div>

          {/* Clean Unboxed Metadata & Live Summary Strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            <span className="font-mono font-semibold text-sky-400 tabular-nums">
              {formattedScale} {syringeUnit} ({volumeMl.toFixed(3)} mL)
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {weeklyDoseMg.toFixed(0)} mg/{lang === 'pt' ? 'sem' : 'wk'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'pt'
                ? 'Escalas U-100 / U-40 / IM'
                : 'U-100 / U-40 / IM Scales'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'pt'
                ? 'Simulação Sérica 42d'
                : '42-Day Serum Curve'}
            </span>
          </div>
        </div>

        {/* Right: Clinical Studio Cover Photo with Seamless Gradient Scrim */}
        <div className="relative min-h-[180px] overflow-hidden bg-[#07090E] lg:col-span-5 lg:min-h-[220px]">
          {!coverFailed ? (
            <img
              src="/src/assets/images/hero_clinical_cover_1795105035189.jpg"
              alt={
                lang === 'pt'
                  ? 'Frascos clínicos estéreis e seringa graduada de precisão em superfície escura'
                  : 'Sterile clinical vials and graduated precision syringe on dark slate'
              }
              referrerPolicy="no-referrer"
              onError={() => setCoverFailed(true)}
              className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-[#0B1220] to-sky-950/40 p-6">
              <Syringe className="h-14 w-14 text-sky-500/40" />
            </div>
          )}

          {/* Measured contrast scrim blending photo into left obsidian panel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-[#0B0E17]/25 to-transparent lg:bg-gradient-to-r lg:from-[#0B0E17] lg:via-[#0B0E17]/35 lg:to-transparent"
          />
        </div>
      </div>
    </section>
  );
};
