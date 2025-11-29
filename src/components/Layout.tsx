import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 flex-shrink-0">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold text-foreground">IMS</h1>
            <div className="ml-auto">
              <PWAInstallButton />
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/30 overflow-y-auto min-h-0">
            {children}
          </main>
        </div>
      </div>
      {/* Auto-trigger install banner after 3 seconds */}
      <PWAInstallBanner />
      {/* Debug panel removed */}
    </SidebarProvider>
  );
}
