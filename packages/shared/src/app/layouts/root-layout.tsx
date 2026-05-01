import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { I18nProvider } from "../../lib/i18n";
import { ThemeProvider } from "../../lib/theme";

export const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <I18nProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Outlet />
          <Toaster richColors closeButton position="bottom-right" />
        </div>
      </I18nProvider>
    </ThemeProvider>
  ),
  beforeLoad: async ({ location }) => {
    // Rediriger la racine vers la page de licence si pas authentifié
    if (location.pathname === "/") {
      throw redirect({ to: "/auth/license" });
    }
  },
});