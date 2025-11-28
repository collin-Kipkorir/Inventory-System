import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installApp, autoPromptDismissed, dismissAutoPrompt } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Show banner after 3 seconds even if beforeinstallprompt hasn't fired (fallback for dev/non-PWA environments)
  useEffect(() => {
    if (!isInstalled && !autoPromptDismissed) {
      const timer = setTimeout(() => {
        // Only show if it looks like a PWA environment (has manifest, service worker registered, etc.)
        // For now, always show as a fallback to help debug
        if (isInstallable || process.env.NODE_ENV === 'development') {
          setShowBanner(true);
          console.log('📱 Showing install banner (fallback)');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, autoPromptDismissed, isInstallable]);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installApp();
    if (!success) {
      setInstalling(false);
    }
  };

  // Only show if: not installed, not dismissed, and either installable or in dev mode
  if (isInstalled || autoPromptDismissed || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs opacity-90">Get quick access on your device</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleInstall}
            disabled={installing}
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            {installing ? 'Installing...' : 'Install'}
          </Button>
          <button
            onClick={() => {
              dismissAutoPrompt();
              setShowBanner(false);
            }}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

