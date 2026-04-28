import { createRootRoute, Outlet } from "@tanstack/react-router";
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
});