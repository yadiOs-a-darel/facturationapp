import type { QueryClient } from "@tanstack/react-query";
import { createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { RegisterTenantPage } from "../features/auth/pages/RegisterTenantPage";
import { LicensePage } from "../features/auth/pages/LicensePage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { InvoicesPage } from "../features/invoices/pages/InvoicesPage";
import { StockPage } from "../features/stock/pages/StockPage";
import { AccountSettingsPage } from "../features/account/pages/AccountSettingsPage";
import { AdministrationPage } from "../features/account/pages/AdministrationPage";
import { isAdminFromToken } from "../lib/auth-token";
import { SuppliersPage } from "../features/suppliers/pages/SuppliersPage";
import { ExpensesPage } from "../features/expenses/pages/ExpensesPage";
import { PurchaseOrdersPage } from "../features/purchase-orders/pages/PurchaseOrdersPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { CashierJournalPage } from "../features/cashier-journal/pages/CashierJournalPage";
import { InvoicePrintPage } from "../features/invoices/pages/InvoicePrintPage";
import { printLayout } from "./layouts/print-layout";
import { UnavailablePage } from "./pages/UnavailablePage";
import { protectedLayout } from "./layouts/protected-layout";
import { isAuthTokenValid } from "../lib/auth-session";
import { rootRoute } from "./layouts/root-layout";

const licenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/license",
  component: LicensePage,
  beforeLoad: async () => {
    if (isAuthTokenValid()) {
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
    if (isAuthTokenValid()) {
      throw redirect({ to: "/" });
    }
  },
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  component: ForgotPasswordPage,
  beforeLoad: async () => {
    if (isAuthTokenValid()) {
      throw redirect({ to: "/" });
    }
  },
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/reset-password",
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || undefined,
  }),
  beforeLoad: async () => {
    if (isAuthTokenValid()) {
      throw redirect({ to: "/" });
    }
  },
});

const registerTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register-tenant",
  component: RegisterTenantPage,
  beforeLoad: async () => {
    if (isAuthTokenValid()) {
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

const administrationRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/admin",
  component: AdministrationPage,
  beforeLoad: async () => {
    if (!isAdminFromToken()) {
      throw redirect({ to: "/" });
    }
  },
});

const suppliersRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/suppliers",
  component: SuppliersPage,
});

const expensesRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/expenses",
  component: ExpensesPage,
});

const purchaseOrdersRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/purchase-orders",
  component: PurchaseOrdersPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/reports",
  component: ReportsPage,
});

const cashierJournalRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/cashier-journal",
  component: CashierJournalPage,
  beforeLoad: async () => {
    if (!isAdminFromToken()) {
      throw redirect({ to: "/" });
    }
  },
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => printLayout,
  path: "/invoices/$invoiceId/print",
  component: InvoicePrintPage,
  validateSearch: (search: Record<string, unknown>) => ({
    auto: (search.auto as string) || undefined,
  }),
});

const routeTree = rootRoute.addChildren([
  licenseRoute,
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  registerTenantRoute,
  protectedLayout.addChildren([
    indexRoute,
    customersRoute,
    invoicesRoute,
    productsRoute,
    stockRoute,
    suppliersRoute,
    expensesRoute,
    purchaseOrdersRoute,
    reportsRoute,
    cashierJournalRoute,
    accountSettingsRoute,
    administrationRoute,
  ]),
  printLayout.addChildren([invoicePrintRoute]),
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
