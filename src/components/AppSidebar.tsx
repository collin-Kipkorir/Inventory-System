import { LayoutDashboard, Building2, Package, FileText, DollarSign, ClipboardList, FileSpreadsheet, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Products", url: "/products", icon: Package },
  { title: "LPOs", url: "/lpos", icon: ClipboardList },
  { title: "Deliveries", url: "/deliveries", icon: FileSpreadsheet },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Payments", url: "/payments", icon: DollarSign },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { logout, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="bg-sidebar">
      <SidebarContent>
        {/* Full-height column so background reaches the bottom and footer can stick */}
        <div className="flex h-full flex-col">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider px-2">
              Supply Management
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="hover:bg-sidebar-accent w-full"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <div
                          className={cn(
                            open ? "flex items-center gap-3 px-3 py-2 w-full" : "flex items-center justify-center w-full py-2",
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                          {open && <span className="text-sm truncate">{item.title}</span>}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer pushes footer to bottom */}
          <div className="flex-1" />

          <SidebarFooter>
            <div className="space-y-3">
              <div className="px-3 py-2 text-xs border-t border-sidebar-border">
                <p className="text-sidebar-foreground/70">Logged in as:</p>
                <p className="font-medium text-sidebar-foreground truncate">{user?.username}</p>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
                {open && <span>Logout</span>}
              </Button>
            </div>
          </SidebarFooter>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
