import type { QueryClient } from "@tanstack/react-query";
import { createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterTenantPage } from "../features/auth/pages/RegisterTenantPage";
import { LicensePage } from "../features/auth/pages/LicensePage";
import { getSession } from "../features/auth/api/client";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { StockPage } from "../features/stock/pages/StockPage";
import { protectedLayout } from "./layouts/protected-layout";
import { rootRoute } from "./layouts/root-layout";

const licenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/license",
  component: LicensePage,
  beforeLoad: async () => {
    const result = await getSession();
    if (result.data?.user) {
      throw redirect({ to: "/" });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  beforeLoad: async () => {
    const result = await getSession();
    if (result.data?.user) {
      throw redirect({ to: "/" });
    }
  },
});

const registerTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register-tenant",
  component: RegisterTenantPage,
  beforeLoad: async () => {
    const result = await getSession();
    if (result.data?.user) {
      throw redirect({ to: "/" });
    }
  },
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

const invoicesRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/invoices",
  component: InvoicesPage,
});

const productsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/products",
  component: ProductsPage,
});

const stockRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/stock",
  component: StockPage,
});

const routeTree = rootRoute.addChildren([
  licenseRoute,
  loginRoute,
  registerTenantRoute,
  protectedLayout.addChildren([
    indexRoute,
    customersRoute,
    invoicesRoute,
    productsRoute,
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
