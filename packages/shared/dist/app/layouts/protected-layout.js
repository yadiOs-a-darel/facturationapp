import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "../../components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
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
        return (_jsxs(SidebarProvider, { defaultOpen: true, style: { "--sidebar-width": "16rem", "--sidebar-width-icon": "4.6rem" }, children: [_jsx(AppSidebar, { collapsible: "icon" }), _jsx(SidebarInset, { children: _jsx("main", { className: "flex-1 min-h-screen bg-white dark:bg-gray-900", children: _jsx("div", { className: "mx-auto max-w-7xl p-6", children: _jsx(Outlet, {}) }) }) })] }));
    },
});
