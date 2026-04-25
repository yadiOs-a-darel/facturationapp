import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import type React from "react";
import { AppSidebar } from "../../components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { getSession } from "../../features/auth/api/client";
import { rootRoute } from "./root-layout";

async function requireAuth() {
  const result = await getSession();
  if (result.error || !result.data?.user) {
    throw redirect({
      to: "/auth/login",
      search: { redirect: window.location.pathname },
    });
  }
  return result.data;
}

export const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: async () => {
    await requireAuth();
  },
  component: function ProtectedLayout() {
    return (
      <SidebarProvider
        defaultOpen={true}
        style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4.6rem" } as React.CSSProperties}
      >
        <AppSidebar collapsible="icon" />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 min-h-screen bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-7xl p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  },
});