import { useEffect, useState } from 'react';

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [autoPromptDismissed, setAutoPromptDismissed] = useState(false);
  const [autoPromptTriggered, setAutoPromptTriggered] = useState(false);
  

  useEffect(() => {
    // Initialize PWA helpers

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ ServiceWorker registered:', registration);
        })
        .catch((err) => {
          console.error('❌ ServiceWorker registration failed:', err);
        });
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app was already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Separate effect for auto-trigger after 3 seconds
  useEffect(() => {
    if (isInstallable && !isInstalled && !autoPromptDismissed && !autoPromptTriggered && deferredPrompt) {
      const autoPromptTimer = setTimeout(async () => {
        console.log('📱 Auto-triggering install prompt after 3 seconds');
        setAutoPromptTriggered(true);
        try {
          await deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User auto-prompt response: ${outcome}`);
          if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
          } else {
            console.log('User dismissed auto-prompt');
          }
          // Clear the prompt after it's been used (can only be called once)
          setDeferredPrompt(null);
        } catch (err) {
          console.error('Auto-prompt failed:', err);
          // Clear even if failed to prevent stuck state
          setDeferredPrompt(null);
        }
      }, 3000);

      return () => clearTimeout(autoPromptTimer);
    }
  }, [isInstallable, isInstalled, autoPromptDismissed, deferredPrompt, autoPromptTriggered]);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User manual response: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        // user dismissed prompt
      }

      // Clear the prompt after use (it can only be called once)
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (err) {
      // Installation failed
      // Clear on error too
      setDeferredPrompt(null);
      return false;
    }
  };

  return {
    isInstallable,
    installApp,
    deferredPrompt,
    isOnline,
    isInstalled,
    autoPromptDismissed,
    dismissAutoPrompt: () => setAutoPromptDismissed(true),
    autoPromptTriggered,
  };
}
