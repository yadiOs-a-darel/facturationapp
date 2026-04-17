import type { QueryClient } from "@tanstack/react-query";
import { createRoute, createRouter, redirect } from "@tanstack/react-router";
import { rootRoute } from "./layouts/root-layout";
import { protectedLayout } from "./layouts/protected-layout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterTenantPage } from "../features/auth/pages/RegisterTenantPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { StockPage } from "../features/stock/pages/StockPage";

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: LoginPage,
  beforeLoad: async () => {
    const token = localStorage.getItem("gestfacturation_token");
    if (token) {
      throw redirect({ to: "/" });
    }
  },
});

const registerTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register-tenant",
  component: RegisterTenantPage,
});

const indexRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/",
  component: DashboardPage,
});

const customersRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/customers",
  component: CustomersPage,
});

const productsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/products",
  component: ProductsPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/invoices",
  component: InvoicesPage,
});

const stockRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/stock",
  component: StockPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerTenantRoute,
  protectedLayout.addChildren([
    indexRoute,
    customersRoute,
    productsRoute,
    invoicesRoute,
    stockRoute,
  ]),
]);

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}