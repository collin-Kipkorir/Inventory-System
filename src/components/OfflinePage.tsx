import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <WifiOff className="h-24 w-24 text-amber-500 relative" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">You're Offline</h1>
        <p className="text-slate-300 mb-8">
          It looks like you've lost your internet connection. Don't worry, you can still view cached data from your recent activity.
        </p>

        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">What you can do:</h2>
          <ul className="text-sm text-slate-400 space-y-2 text-left">
            <li>✓ View your dashboard and recent data</li>
            <li>✓ Check invoices and payment history</li>
            <li>✓ Browse companies and products</li>
            <li>✗ Create new records (requires internet)</li>
            <li>✗ Upload files (requires internet)</li>
          </ul>
        </div>

        <Button
          onClick={handleRetry}
          size="lg"
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <p className="text-xs text-slate-500 mt-6">
          Changes made while offline will be synced once you're back online.
        </p>
      </div>
    </div>
  );
}
