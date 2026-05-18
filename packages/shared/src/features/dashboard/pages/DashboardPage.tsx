import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "../hooks/use-reports";
import { useAuth } from "../../auth/hooks/use-auth";
import { useI18n } from "../../../lib/i18n";
import {
  TrendingUp,
  FileText,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PageHeader } from "../../../components/layout/page-header";
import { usePageTitle } from "../../../hooks/use-page-title";

interface StatCard {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  color: "emerald" | "blue" | "red" | "amber";
}

interface ColorConfig {
  bg: string;
  text: string;
  border: string;
}

const colorConfig: Record<"emerald" | "blue" | "red" | "amber", ColorConfig> = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
};

export function DashboardPage(): JSX.Element {
  usePageTitle("Tableau de bord");
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const { user } = useAuth();
  const { t } = useI18n();

  const stats: StatCard[] = [
    { title: t("dashboard.totalSales"), value: `${data?.data?.totalSales?.toLocaleString() ?? 0} DA`, icon: TrendingUp, trend: "+12.5%", trendUp: true, color: "emerald" },
    { title: t("dashboard.totalInvoices"), value: String(data?.data?.totalInvoices ?? 0), icon: FileText, trend: "+8.2%", trendUp: true, color: "blue" },
    { title: t("dashboard.unpaidInvoices"), value: String(data?.data?.unpaidInvoices ?? 0), icon: AlertCircle, trend: "-2.1%", trendUp: true, color: "red" },
    { title: t("dashboard.stockValue"), value: `${data?.data?.stockValue?.toLocaleString() ?? 0} DA`, icon: Package, trend: "+5.3%", trendUp: true, color: "amber" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dashboard.title")} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i: number) => (
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
        description={user?.firstName ? `Hi, ${user.firstName} ${user.lastName}` : "Welcome"}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: StatCard) => {
          const Icon = stat.icon;
          const colors: ColorConfig = colorConfig[stat.color];

          return (
            <Card key={stat.title} className={`relative overflow-hidden ${colors.border}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="text-xs font-medium text-emerald-600">{stat.trend}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("invoices.recent")}</CardTitle>
            <Button variant="ghost" size="sm">{t("common.viewAll")}</Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">{t("invoices.empty")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("stock.alerts")}</CardTitle>
            <Button variant="ghost" size="sm">{t("common.viewAll")}</Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">{t("products.empty")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate({ to: "/invoices" })}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Nouvelle facture</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate({ to: "/products" })}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Ajouter produit</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate({ to: "/invoices" })}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Voir rapports</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate({ to: "/stock" })}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs">Alertes stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
