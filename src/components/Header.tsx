import React from 'react';
import {Bookmark, FlaskConical, Gauge, RotateCcw, Syringe} from 'lucide-react';
import type {Dictionary, Language} from '../i18n/translations';
import type {AppTab} from '../types/calculator';
import {PWAInstallButton} from './PWAInstallButton';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  t: Dictionary;
  lang: Language;
  onSaveProtocolClick: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  t,
  lang,
  onSaveProtocolClick,
  savedCount,
}) => {
  const navItems: Array<{id: AppTab; label: string; icon: React.ReactNode}> = [
    {id: 'trt', label: t.nav.trt, icon: <Syringe className="h-5 w-5" />},
    {id: 'reverse', label: t.nav.reverse, icon: <RotateCcw className="h-5 w-5" />},
    {id: 'peptide', label: t.nav.peptide, icon: <FlaskConical className="h-5 w-5" />},
    {id: 'protocols', label: t.nav.protocols, icon: <Bookmark className="h-5 w-5" />},
  ];

  return (
    <>
      {/* Desktop & Mobile Top Bar (Strictly 3 zones: Brand — Nav Links — Primary Action) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0B0E17]/95">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('trt');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-slate-100"
          >
            {t.brand}
          </a>

          {/* Zone 2: Clean Typography Nav Links (Desktop) */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 ${
                    isActive
                      ? 'text-slate-900 font-semibold dark:text-white'
                      : 'hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'protocols' && savedCount > 0 && (
                    <span className="ml-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      ({savedCount})
                    </span>
                  )}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-sky-600 dark:bg-sky-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <PWAInstallButton
              t={t}
              lang={lang}
              fallbackAction={
                <button
                  type="button"
                  onClick={onSaveProtocolClick}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  <Gauge className="h-4 w-4 shrink-0" />
                  <span>{t.actions.saveProtocol}</span>
                </button>
              }
            />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Tab Bar (<= 15% viewport height, >=44px hitboxes) */}
      <nav
        aria-label="Menu inferior móvel"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-4 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-[#0B0E17]/95"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {item.icon}
              <span className="max-w-full truncate text-[11px] font-medium tracking-tight">
                {item.id === 'trt'
                  ? 'TRT'
                  : item.id === 'reverse'
                    ? 'Reverso'
                    : item.id === 'peptide'
                      ? lang === 'pt'
                        ? 'Peptídeos'
                        : 'Peptides'
                      : lang === 'pt'
                        ? 'Salvos'
                        : 'Saved'}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
