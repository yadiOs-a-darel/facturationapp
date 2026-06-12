import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { UnavailablePage } from "../pages/UnavailablePage";
import { hasValidAuthSession } from "../../lib/auth-session";
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
    if (location.pathname === "/" && !hasValidAuthSession()) {
      throw redirect({ to: "/auth/login" });
    }
  },
  notFoundComponent: UnavailablePage,
});