import { Download, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export function PWAInstallButton() {
  const { isInstallable, isOnline, isInstalled, installApp } = usePWA();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installApp();
    if (!success) {
      setInstalling(false);
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-muted">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-amber-600" />
            <span className="text-amber-600">Offline</span>
          </>
        )}
      </div>

      {/* Install Button */}
      {isInstallable && isOnline && (
        <Button
          onClick={handleInstall}
          disabled={installing}
          size="sm"
          className="gap-2"
          title="Install app on your device"
        >
          <Download className="h-4 w-4" />
          {installing ? 'Installing...' : 'Install App'}
        </Button>
      )}
    </div>
  );
}
