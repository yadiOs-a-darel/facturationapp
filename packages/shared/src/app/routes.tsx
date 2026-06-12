import type { QueryClient } from "@tanstack/react-query";
import { createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterTenantPage } from "../features/auth/pages/RegisterTenantPage";
import { LicensePage } from "../features/auth/pages/LicensePage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { StockPage } from "../features/stock/pages/StockPage";
import { AccountSettingsPage } from "../features/account/pages/AccountSettingsPage";
import { UnavailablePage } from "./pages/UnavailablePage";
import { protectedLayout } from "./layouts/protected-layout";
import { rootRoute } from "./layouts/root-layout";

const hasToken = () => typeof window !== 'undefined' && !!localStorage.getItem("gestfacturation_token");

const licenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/license",
  component: LicensePage,
  beforeLoad: async () => {
    if (hasToken()) {
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
    if (hasToken()) {
      throw redirect({ to: "/" });
    }
  },
});

const registerTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register-tenant",
  component: RegisterTenantPage,
  beforeLoad: async () => {
    if (hasToken()) {
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

const accountSettingsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/account/settings",
  component: AccountSettingsPage,
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
    accountSettingsRoute,
  ]),
]);

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultNotFoundComponent: UnavailablePage,
  });
}
