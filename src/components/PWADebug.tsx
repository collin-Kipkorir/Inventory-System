import { usePWA } from '@/hooks/usePWA';

export function PWADebug() {
  const { isInstallable, isInstalled, isOnline, deferredPrompt, debugInfo } = usePWA();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 p-3 bg-slate-900 text-white text-xs max-w-sm rounded-tl-lg border-t border-l border-slate-700 z-40 font-mono max-h-40 overflow-y-auto">
      <div className="space-y-1">
        <div>🔍 PWA Debug Info:</div>
        <div className="text-slate-300">{debugInfo}</div>
        <div className={isInstalled ? 'text-green-400' : 'text-yellow-400'}>
          Installed: {isInstalled ? '✅ Yes' : '❌ No'}
        </div>
        <div className={isInstallable ? 'text-green-400' : 'text-yellow-400'}>
          Installable: {isInstallable ? '✅ Yes' : '❌ No'}
        </div>
        <div className={deferredPrompt ? 'text-green-400' : 'text-yellow-400'}>
          Prompt Available: {deferredPrompt ? '✅ Yes' : '❌ No'}
        </div>
        <div className={isOnline ? 'text-green-400' : 'text-red-400'}>
          Online: {isOnline ? '🟢 Yes' : '🔴 No'}
        </div>
        <div className="text-slate-400 mt-2">
          Open Console (F12) for full logs
        </div>
      </div>
    </div>
  );
}
