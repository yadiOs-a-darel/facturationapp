import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDashboard } from "../hooks/use-reports";
import { useAuth } from "../../auth/hooks/use-auth";
import { useI18n } from "../../../lib/i18n";
import { TrendingUp, FileText, AlertCircle, Package, ArrowUpRight, ArrowDownRight, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PageHeader } from "../../../components/layout/page-header";
import { usePageTitle } from "../../../hooks/use-page-title";
export function DashboardPage() {
    usePageTitle("Tableau de bord");
    const { data, isLoading } = useDashboard();
    const { user } = useAuth();
    const { t } = useI18n();
    const stats = [
        {
            title: t("dashboard.totalSales"),
            value: `${data?.data?.totalSales?.toLocaleString() ?? 0} DA`,
            icon: TrendingUp,
            trend: "+12.5%",
            trendUp: true,
            color: "emerald",
        },
        {
            title: t("dashboard.totalInvoices"),
            value: String(data?.data?.totalInvoices ?? 0),
            icon: FileText,
            trend: "+8.2%",
            trendUp: true,
            color: "blue",
        },
        {
            title: t("dashboard.unpaidInvoices"),
            value: String(data?.data?.unpaidInvoices ?? 0),
            icon: AlertCircle,
            trend: "-2.1%",
            trendUp: true,
            color: "red",
        },
        {
            title: t("dashboard.stockValue"),
            value: `${data?.data?.stockValue?.toLocaleString() ?? 0} DA`,
            icon: Package,
            trend: "+5.3%",
            trendUp: true,
            color: "amber",
        },
    ];
    const colorConfig = {
        emerald: {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-200 dark:border-emerald-800",
        },
        blue: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-600 dark:text-blue-400",
            border: "border-blue-200 dark:border-blue-800",
        },
        red: {
            bg: "bg-red-50 dark:bg-red-900/20",
            text: "text-red-600 dark:text-red-400",
            border: "border-red-200 dark:border-red-800",
        },
        amber: {
            bg: "bg-amber-50 dark:bg-amber-900/20",
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-200 dark:border-amber-800",
        },
    };
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t("dashboard.title") }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "h-32 bg-muted animate-pulse rounded-lg" }, i))) })] }));
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsx(PageHeader, { title: t("dashboard.title"), description: user?.firstName
                    ? `Bonjour, ${user.firstName} ${user.lastName}`
                    : "Bienvenue" }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat) => {
                    const Icon = stat.icon;
                    const colors = colorConfig[stat.color];
                    return (_jsx(Card, { className: `relative overflow-hidden ${colors.border}`, children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`, children: _jsx(Icon, { className: `h-6 w-6 ${colors.text}` }) }), _jsxs("div", { className: "flex items-center gap-1", children: [stat.trendUp ? (_jsx(ArrowUpRight, { className: "h-4 w-4 text-emerald-600" })) : (_jsx(ArrowDownRight, { className: "h-4 w-4 text-emerald-600" })), _jsx("span", { className: "text-xs font-medium text-emerald-600", children: stat.trend })] })] }), _jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: stat.title }), _jsx("p", { className: "mt-1 text-2xl font-bold", children: stat.value })] }) }, stat.title));
                }) }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: t("invoices.recent") }), _jsx(Button, { variant: "ghost", size: "sm", children: t("common.viewAll") })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx(FileText, { className: "h-12 w-12 text-muted-foreground/50 mb-3" }), _jsx("p", { className: "text-muted-foreground", children: t("invoices.empty") })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: t("stock.alerts") }), _jsx(Button, { variant: "ghost", size: "sm", children: t("common.viewAll") })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx(Package, { className: "h-12 w-12 text-muted-foreground/50 mb-3" }), _jsx("p", { className: "text-muted-foreground", children: t("products.empty") })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg font-semibold", children: "Actions rapides" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs(Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", children: [_jsx(FileText, { className: "h-5 w-5" }), _jsx("span", { className: "text-xs", children: "Nouvelle facture" })] }), _jsxs(Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", children: [_jsx(Package, { className: "h-5 w-5" }), _jsx("span", { className: "text-xs", children: "Ajouter produit" })] }), _jsxs(Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), _jsx("span", { className: "text-xs", children: "Voir rapports" })] }), _jsxs(Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsx("span", { className: "text-xs", children: "Alertes stock" })] })] }) })] })] }));
}
