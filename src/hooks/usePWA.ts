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
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('🔧 PWA Hook: Initializing...');

    // Check basic PWA requirements
    const checks = {
      https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      serviceWorker: 'serviceWorker' in navigator,
      manifestLink: !!document.querySelector('link[rel="manifest"]'),
    };
    console.log('📋 PWA Requirements:', checks);
    setDebugInfo(`HTTPS: ${checks.https}, SW: ${checks.serviceWorker}, Manifest: ${checks.manifestLink}`);

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
      console.log('🎉 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
      console.log('📱 PWA install prompt available');
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('✅ appinstalled event fired - app installed!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Handle online/offline events
    const handleOnline = () => {
      console.log('🟢 Online');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('🔴 Offline');
      setIsOnline(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app was already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📦 App is running in standalone mode (already installed)');
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
      console.warn('❌ Install prompt not available - it may have been consumed by auto-trigger');
      return false;
    }

    try {
      console.log('🔧 Manually triggering install prompt from button click');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User manual response: ${outcome}`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        console.log('User dismissed manual install prompt');
      }

      // Clear the prompt after use (it can only be called once)
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (err) {
      console.error('Installation failed:', err);
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
    debugInfo,
  };
}
