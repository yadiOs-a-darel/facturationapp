export { createAppRouter } from "./app/routes";
export { App } from "./app/App";
export { rootRoute } from "./app/layouts/root-layout";
export { protectedLayout } from "./app/layouts/protected-layout";

export { createQueryClient, QueryKeys, sessionKeys, tenantKeys, customersKeys, productsKeys, invoicesKeys, stockKeys, reportsKeys, paymentMethodsKeys, attachmentsKeys } from "./lib/query";
export { cn } from "./lib/utils";

export { apiClient } from "./lib/api-client";

export * from "./features/auth/api/client";
export * from "./features/auth/hooks/use-auth";
export * from "./features/auth/types";
export { LoginPage } from "./features/auth/pages/LoginPage";
export { RegisterTenantPage } from "./features/auth/pages/RegisterTenantPage";

export * from "./features/customers/api/client";
export * from "./features/customers/hooks/use-customers";
export * from "./features/customers/types";

export * from "./features/invoices/api/client";
export * from "./features/invoices/hooks/use-invoices";
export * from "./features/invoices/types";

export * from "./features/products/api/client";
export * from "./features/products/hooks/use-products";
export * from "./features/products/types";

export * from "./features/stock/api/client";
export * from "./features/stock/hooks/use-stock";
export * from "./features/stock/types";

export * from "./features/dashboard/hooks/use-reports";

export { ThemeProvider, useTheme } from "./lib/theme";
export { I18nProvider, useI18n } from "./lib/i18n";
export { ThemeSwitcher } from "./components/header/ThemeSwitcher";
export { LanguageSwitcher } from "./components/header/LanguageSwitcher";

export { AppSidebar } from "./components/layout/app-sidebar";
export { ContentLayout } from "./components/layout/content-layout";
export { PageHeader } from "./components/layout/page-header";
export { StatusBadge } from "./components/layout/status-badge";

export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/checkbox";
export * from "./components/ui/dialog";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/pagination";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sidebar";
export * from "./components/ui/skeleton";
export * from "./components/ui/table";
export * from "./components/ui/tooltip";

export { useIsMobile } from "./hooks/use-mobile";