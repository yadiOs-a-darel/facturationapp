import { createRoute, Outlet } from "@tanstack/react-router";
import { UnavailablePage } from "../pages/UnavailablePage";
import { ensureAuthenticatedSession } from "../../lib/ensure-auth";
import { rootRoute } from "./root-layout";

export const printLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "print",
  beforeLoad: async ({ context, location }) => {
    await ensureAuthenticatedSession(
      context.queryClient,
      location.pathname + (location.searchStr ?? ""),
    );
  },
  component: function PrintLayout() {
    return <Outlet />;
  },
  notFoundComponent: UnavailablePage,
});
