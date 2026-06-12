import { createRoute, Outlet } from "@tanstack/react-router";
import { UnavailablePage } from "../pages/UnavailablePage";
import { AuthGate } from "../../features/auth/components/AuthGate";
import { AppSidebar } from "../../components/layout/app-sidebar";
import { TenantBrandTheme } from "../../features/account/components/TenantBrandTheme";
import { ensureAuthenticatedSession } from "../../lib/ensure-auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { rootRoute } from "./root-layout";

export const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: async ({ context, location }) => {
    await ensureAuthenticatedSession(
      context.queryClient,
      location.pathname + (location.searchStr ?? ""),
    );
  },
  component: function ProtectedLayout() {
    return (
      <AuthGate>
        <SidebarProvider defaultOpen={true}>
          <TenantBrandTheme />
          <AppSidebar collapsible="icon" />
          <SidebarInset>
            <header className="flex h-14 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <span className="font-semibold">GestFacturation</span>
            </header>
            <main className="flex-1 min-h-screen bg-white dark:bg-gray-900">
              <div className="mx-auto max-w-7xl p-6">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AuthGate>
    );
  },
  notFoundComponent: UnavailablePage,
});