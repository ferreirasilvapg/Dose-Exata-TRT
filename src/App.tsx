import {useEffect, useMemo, useState} from 'react';
import {Languages, Moon, Sun} from 'lucide-react';
import {Header} from './components/Header';
import {HeroCover} from './components/HeroCover';
import {OfflineIndicator} from './components/OfflineIndicator';
import {PeptideCalculatorView} from './components/PeptideCalculatorView';
import {ProtocolsView} from './components/ProtocolsView';
import {ReverseCalculatorView} from './components/ReverseCalculatorView';
import {TRTCalculatorView} from './components/TRTCalculatorView';
import {ESTERS, SYRINGES} from './data/pharmacology';
import {TRANSLATIONS} from './i18n/translations';
import type {AppTab, Language, SavedProtocol, TRTInput} from './types/calculator';
import {calculateTRT} from './utils/calculations';

const DEFAULT_TRT_INPUT: TRTInput = {
  doseInputMode: 'weekly',
  doseMg: 140,
  intervalDays: 3.5,
  concentrationMgPerMl: 200,
  esterId: 'cypionate',
  syringeId: 'u100_05',
  vialVolumeMl: 10,
  includeDeadSpace: true,
};

const STORAGE_KEYS = {
  TRT_INPUT: 'doseexata_trt_input_v1',
  PROTOCOLS: 'doseexata_protocols_v1',
  THEME: 'doseexata_theme_v1',
  LANG: 'doseexata_lang_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('trt');

  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return saved === 'en' ? 'en' : 'pt';
    } catch {
      return 'pt';
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const [trtInput, setTrtInput] = useState<TRTInput>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRT_INPUT);
      if (raw) {
        return {...DEFAULT_TRT_INPUT, ...JSON.parse(raw)};
      }
    } catch {
      // ignore invalid storage
    }
    return DEFAULT_TRT_INPUT;
  });

  const [savedProtocols, setSavedProtocols] = useState<SavedProtocol[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROTOCOLS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore invalid storage
    }
    return [];
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRT_INPUT, JSON.stringify(trtInput));
    } catch {
      // ignore
    }
  }, [trtInput]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PROTOCOLS,
        JSON.stringify(savedProtocols)
      );
    } catch {
      // ignore
    }
  }, [savedProtocols]);

  const t = TRANSLATIONS[lang];
  const trtResult = useMemo(() => calculateTRT(trtInput), [trtInput]);

  const handleSaveProtocol = (customName?: string) => {
    const ester = ESTERS[trtInput.esterId];
    const name =
      customName?.trim() ||
      `${ester.shortName} ${Math.round(trtResult.weeklyDoseMg)}mg/sem`;
    const todayIso = new Date().toISOString().slice(0, 10);
    const next: SavedProtocol = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      createdAt: new Date().toISOString(),
      startDate: todayIso,
      input: {...trtInput},
    };
    setSavedProtocols((prev) => [next, ...prev]);
  };

  const handleLoadProtocol = (protocol: SavedProtocol) => {
    setTrtInput({...DEFAULT_TRT_INPUT, ...protocol.input});
    setActiveTab('trt');
  };

  const handleDeleteProtocol = (id: string) => {
    setSavedProtocols((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateStartDate = (id: string, startDate: string) => {
    setSavedProtocols((prev) =>
      prev.map((p) => (p.id === id ? {...p, startDate} : p))
    );
  };

  const currentEster = ESTERS[trtInput.esterId];
  const currentSyringe = SYRINGES[trtInput.syringeId];

  return (
    <div
      id="top"
      className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#07090E] dark:text-slate-100"
    >
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        t={t}
        lang={lang}
        onSaveProtocolClick={() => handleSaveProtocol()}
        savedCount={savedProtocols.length}
      />

      {/* Workspace Utility Strip (Clean unboxed metadata + PT/EN & Theme controls) */}
      <div className="border-b border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-[#0B0E17]/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {currentEster.shortName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {trtInput.concentrationMgPerMl} mg/mL
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {currentSyringe.shortLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'pt' ? 'en' : 'pt'))}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Languages className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>{lang === 'pt' ? 'PT-BR' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme((cur) => (cur === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24 sm:px-6 md:pb-12 lg:px-8">
        <HeroCover
          t={t}
          lang={lang}
          weeklyDoseMg={trtResult.weeklyDoseMg}
          syringeScaleValue={trtResult.syringeScaleValue}
          syringeUnit={currentSyringe.scaleType === 'mL' ? 'mL' : 'UI'}
          volumeMl={trtResult.volumePerInjectionMl}
        />

        {activeTab === 'trt' && (
          <TRTCalculatorView
            input={trtInput}
            result={trtResult}
            onChange={setTrtInput}
            onReset={() => setTrtInput(DEFAULT_TRT_INPUT)}
            onSaveProtocol={handleSaveProtocol}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'reverse' && (
          <ReverseCalculatorView
            t={t}
            lang={lang}
            defaultConcentration={trtInput.concentrationMgPerMl}
            defaultEster={trtInput.esterId}
            defaultInterval={trtInput.intervalDays}
          />
        )}

        {activeTab === 'peptide' && (
          <PeptideCalculatorView t={t} lang={lang} />
        )}

        {activeTab === 'protocols' && (
          <ProtocolsView
            protocols={savedProtocols}
            onLoad={handleLoadProtocol}
            onDelete={handleDeleteProtocol}
            onUpdateStartDate={handleUpdateStartDate}
            t={t}
            lang={lang}
          />
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>{t.disclaimer}</p>
        </footer>
      </main>

      <OfflineIndicator t={t} />
    </div>
  );
}
