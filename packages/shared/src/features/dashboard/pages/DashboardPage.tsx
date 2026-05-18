import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "../hooks/use-reports";
import { useAuth } from "../../auth/hooks/use-auth";
import { useI18n } from "../../../lib/i18n";
import {
  TrendingUp,
  FileText,
  AlertCircle,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PageHeader } from "../../../components/layout/page-header";
import { usePageTitle } from "../../../hooks/use-page-title";
import { formatCurrency } from "../../../lib/format";
import { StatusBadge } from "../../../components/ui/data-table";
import { Badge } from "../../../components/ui/badge";

interface StatCard {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "emerald" | "blue" | "red" | "amber";
}

const colorConfig = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
};

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DashboardPage(): JSX.Element {
  usePageTitle("Tableau de bord");
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const { user } = useAuth();
  const { t } = useI18n();

  const kpis = data?.data;

  const stats: StatCard[] = [
    { title: t("dashboard.totalSales"), value: formatCurrency(kpis?.totalSales ?? 0), icon: TrendingUp, color: "emerald" },
    { title: t("dashboard.totalInvoices"), value: String(kpis?.totalInvoices ?? 0), icon: FileText, color: "blue" },
    { title: t("dashboard.unpaidInvoices"), value: String(kpis?.unpaidInvoices ?? 0), icon: AlertCircle, color: "red" },
    { title: t("dashboard.stockValue"), value: formatCurrency(kpis?.stockValue ?? 0), icon: Package, color: "amber" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dashboard.title")} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("dashboard.title")}
        description={user?.firstName ? `Bonjour, ${user.firstName}` : t("dashboard.welcome")}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorConfig[stat.color];
          return (
            <Card key={stat.title} className={`relative overflow-hidden ${colors.border}`}>
              <CardContent className="p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("invoices.recent")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/invoices" })}>
              {t("common.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            {(kpis?.recentInvoices?.length ?? 0) > 0 ? (
              <ul className="divide-y">
                {kpis?.recentInvoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{inv.number}</p>
                      <p className="text-sm text-muted-foreground truncate">{inv.customerName}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-medium">{formatCurrency(inv.totalTTC)}</p>
                      <div className="flex items-center justify-end gap-2">
                        <StatusBadge status={inv.status} />
                        <span className="text-xs text-muted-foreground">{formatShortDate(inv.issueDate)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t("invoices.empty")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("stock.alerts")}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/stock" })}>
              {t("common.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            {(kpis?.stockAlerts?.length ?? 0) > 0 ? (
              <ul className="divide-y">
                {kpis?.stockAlerts.map((alert) => (
                  <li key={alert.productId} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.code}</p>
                    </div>
                    <Badge variant="destructive">
                      {alert.stockQuantity} / min {alert.stockMin}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucune alerte stock</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate({ to: "/invoices" })}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Nouvelle facture</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate({ to: "/products" })}>
              <Package className="h-5 w-5" />
              <span className="text-xs">Produits</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate({ to: "/customers" })}>
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Clients</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate({ to: "/stock" })}>
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs">Stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
