import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const rootRoute = createRootRoute({
  component: () => (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Outlet />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  ),
});