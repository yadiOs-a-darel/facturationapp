import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { I18nProvider } from "../../lib/i18n";
import { ThemeProvider } from "../../lib/theme";
export const rootRoute = createRootRoute({
    component: () => (_jsx(ThemeProvider, { children: _jsx(I18nProvider, { children: _jsxs("div", { className: "min-h-screen bg-white dark:bg-gray-900", children: [_jsx(Outlet, {}), _jsx(Toaster, { richColors: true, closeButton: true, position: "bottom-right" })] }) }) })),
});
