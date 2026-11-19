import React, {useState} from 'react';
import {Calendar, Download, Trash2, Upload} from 'lucide-react';
import {ESTERS, SYRINGES} from '../data/pharmacology';
import type {Dictionary, Language} from '../i18n/translations';
import type {SavedProtocol} from '../types/calculator';
import {
  buildICSContent,
  calculateTRT,
  generateUpcomingDates,
} from '../utils/calculations';

interface ProtocolsViewProps {
  protocols: SavedProtocol[];
  onLoad: (protocol: SavedProtocol) => void;
  onDelete: (id: string) => void;
  onUpdateStartDate: (id: string, date: string) => void;
  t: Dictionary;
  lang: Language;
}

export const ProtocolsView: React.FC<ProtocolsViewProps> = ({
  protocols,
  onLoad,
  onDelete,
  onUpdateStartDate,
  t,
  lang,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    protocols[0]?.id ?? null
  );

  const handleExportICS = (protocol: SavedProtocol) => {
    const res = calculateTRT(protocol.input);
    const syringe = SYRINGES[protocol.input.syringeId];
    const ester = ESTERS[protocol.input.esterId];
    const unit = syringe.scaleType === 'mL' ? 'mL' : 'UI';
    const scaleVal =
      syringe.scaleType === 'mL'
        ? res.syringeScaleValue.toFixed(2)
        : res.syringeScaleValue.toFixed(1).replace(/\.0$/, '');

    const dates = generateUpcomingDates(
      protocol.startDate,
      protocol.input.intervalDays,
      16
    );
    const description = `${lang === 'pt' ? ester.namePt : ester.nameEn}: ${res.dosePerInjectionMg.toFixed(1)} mg (${res.volumePerInjectionMl.toFixed(3)} mL / ${scaleVal} ${unit} ${syringe.shortLabel})`;
    const ics = buildICSContent(
      `DoseExata — ${protocol.name}`,
      description,
      dates
    );

    const blob = new Blob([ics], {type: 'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${protocol.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
          {t.protocols.title}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t.protocols.subtitle}
        </p>
      </div>

      {protocols.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
            {t.protocols.emptyState}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {protocols.map((p) => {
            const res = calculateTRT(p.input);
            const ester = ESTERS[p.input.esterId];
            const syringe = SYRINGES[p.input.syringeId];
            const unit = syringe.scaleType === 'mL' ? 'mL' : 'UI';
            const scaleVal =
              syringe.scaleType === 'mL'
                ? res.syringeScaleValue.toFixed(2)
                : res.syringeScaleValue.toFixed(1).replace(/\.0$/, '');
            const upcoming = generateUpcomingDates(
              p.startDate,
              p.input.intervalDays,
              8
            );
            const isExpanded = expandedId === p.id;

            return (
              <article
                key={p.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
                      <span>{ester.shortName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{res.weeklyDoseMg.toFixed(1)} mg/sem</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {res.dosePerInjectionMg.toFixed(1)} mg / {scaleVal} {unit} (
                        {res.volumePerInjectionMl.toFixed(3)} mL)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{p.input.concentrationMgPerMl} mg/mL</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : p.id)
                      }
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{t.protocols.upcomingDates}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoad(p)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{t.actions.load}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      aria-label={t.actions.delete}
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`start-date-${p.id}`}
                          className="text-xs font-medium text-slate-600 dark:text-slate-400"
                        >
                          {t.protocols.startDate}:
                        </label>
                        <input
                          id={`start-date-${p.id}`}
                          type="date"
                          value={p.startDate}
                          onChange={(e) =>
                            onUpdateStartDate(p.id, e.target.value)
                          }
                          className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExportICS(p)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{t.actions.exportCalendar}</span>
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {upcoming.map((date, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs tabular-nums dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            #{idx + 1} · {scaleVal} {unit}
                          </div>
                          <div className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                            {date.toLocaleDateString(
                              lang === 'pt' ? 'pt-BR' : 'en-US',
                              {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
