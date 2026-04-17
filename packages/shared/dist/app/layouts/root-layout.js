import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
export const rootRoute = createRootRoute({
    component: () => (_jsxs("div", { style: { minHeight: "100vh", backgroundColor: "#fafafa" }, children: [_jsx(Outlet, {}), _jsx(Toaster, { richColors: true, closeButton: true, position: "bottom-right" })] })),
});
