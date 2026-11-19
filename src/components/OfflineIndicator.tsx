import React from 'react';
import {WifiOff} from 'lucide-react';
import {useOnlineStatus} from '../hooks/useOnlineStatus';
import type {Dictionary} from '../i18n/translations';

export const OfflineIndicator: React.FC<{t: Dictionary}> = ({t}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-950 shadow-md md:bottom-4 md:left-4 md:right-auto dark:border-amber-700/60 dark:bg-amber-950/90 dark:text-amber-100"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
      <span>{t.offline}</span>
    </div>
  );
};
