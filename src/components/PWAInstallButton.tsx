import React, {useState} from 'react';
import {Download, Share, Smartphone, X} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWAInstall';
import type {Dictionary, Language} from '../i18n/translations';

interface PWAInstallButtonProps {
  t: Dictionary;
  lang: Language;
  fallbackAction?: React.ReactNode;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  t,
  lang,
  fallbackAction,
}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return <>{fallbackAction ?? null}</>;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{t.actions.installApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>{t.actions.installIOS}</span>
        </button>

        {showGuideModal && (
          <InstallGuideModal
            t={t}
            lang={lang}
            isIOS={true}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuideModal(true)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <Smartphone className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <span>{t.actions.installApp}</span>
      </button>

      {showGuideModal && (
        <InstallGuideModal
          t={t}
          lang={lang}
          isIOS={false}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
};

interface InstallGuideModalProps {
  t: Dictionary;
  lang: Language;
  isIOS: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  t,
  lang,
  isIOS,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/app_brand_emblem_1795105035506.jpg"
              alt="DoseExata"
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-xl border border-sky-500/30 object-cover"
            />
            <h3
              id="pwa-install-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {isIOS
                ? t.iosGuide.title
                : lang === 'pt'
                  ? 'Instalar DoseExata no Celular'
                  : 'Install DoseExata on Mobile'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isIOS ? (
          <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <li>{t.iosGuide.step1}</li>
            <li>{t.iosGuide.step2}</li>
            <li>{t.iosGuide.step3}</li>
          </ol>
        ) : (
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              {lang === 'pt'
                ? 'Este aplicativo é um PWA instalável com funcionamento 100% offline:'
                : 'This app is an installable offline-ready PWA:'}
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-200">
              <li>
                <strong className="font-semibold">Android (Chrome / Edge):</strong>{' '}
                {lang === 'pt'
                  ? 'Abra o menu (⋮) no navegador e toque em "Instalar aplicativo" ou "Adicionar à tela inicial".'
                  : 'Open the browser menu (⋮) and tap "Install app" or "Add to Home screen".'}
              </li>
              <li>
                <strong className="font-semibold">iPhone / iPad (Safari):</strong>{' '}
                {lang === 'pt'
                  ? 'Toque em Compartilhar (↑) e selecione "Adicionar à Tela de Início".'
                  : 'Tap Share (↑) and choose "Add to Home Screen".'}
              </li>
              <li>
                <strong className="font-semibold">Desktop (Chrome / Edge):</strong>{' '}
                {lang === 'pt'
                  ? 'Clique no ícone de instalação na barra de endereço quando aberto em janela própria.'
                  : 'Click the install icon in the address bar when opened outside an embedded frame.'}
              </li>
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {t.actions.close}
        </button>
      </div>
    </div>
  );
};
