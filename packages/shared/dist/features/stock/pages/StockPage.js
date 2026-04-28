import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useStockMovements, useStockAlerts, useAdjustStock } from "../hooks/use-stock";
import { useProducts } from "../../products/hooks/use-products";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import { Search, Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Plus, } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import { usePageTitle } from "../../../hooks/use-page-title";
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function StockPage() {
    usePageTitle("Stock");
    const { data: movements, isLoading: movementsLoading } = useStockMovements();
    const { data: alerts, isLoading: alertsLoading } = useStockAlerts();
    const { data: products } = useProducts();
    const adjustStock = useAdjustStock();
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [tab, setTab] = useState("movements");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({
        productId: "",
        quantity: 0,
        type: "IN",
        reason: "",
    });
    const filteredMovements = movements?.data.filter((m) => {
        const matchesSearch = !search ||
            products?.data.some((p) => p.id === m.productId &&
                p.name.toLowerCase().includes(search.toLowerCase()));
        const matchesType = !typeFilter || m.type === typeFilter;
        return matchesSearch && matchesType;
    }) ?? [];
    const filteredAlerts = alerts?.data ?? [];
    const handleSubmit = () => {
        adjustStock.mutate(form, {
            onSuccess: () => {
                setDialogOpen(false);
                setForm({ productId: "", quantity: 0, type: "IN", reason: "" });
            },
        });
    };
    const getProductName = (productId) => {
        const product = products?.data.find((p) => p.id === productId);
        return product?.name || "Produit";
    };
    const getMovementTypeConfig = (type) => {
        switch (type) {
            case "IN":
                return {
                    label: "Entrée",
                    icon: ArrowDownLeft,
                    badgeVariant: "success",
                };
            case "OUT":
                return {
                    label: "Sortie",
                    icon: ArrowUpRight,
                    badgeVariant: "destructive",
                };
            default:
                return {
                    label: "Ajustement",
                    icon: Package,
                    badgeVariant: "secondary",
                };
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t("stock.title"), description: `${filteredMovements.length} mouvement${filteredMovements.length > 1 ? "s" : ""}`, action: _jsxs(Button, { onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), t("stock.adjust")] }) }), _jsxs(Tabs, { value: tab, onValueChange: setTab, children: [_jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "movements", className: "gap-2", children: [t("stock.movements"), _jsx(Badge, { variant: "secondary", size: "sm", children: filteredMovements.length })] }), _jsxs(TabsTrigger, { value: "alerts", className: "gap-2", children: [t("stock.alerts"), filteredAlerts.length > 0 && (_jsx(Badge, { variant: "warning", size: "sm", children: filteredAlerts.length }))] })] }), _jsx(TabsContent, { value: "movements", className: "mt-6", children: _jsxs(Card, { children: [_jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("common.search"), className: "pl-9" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: typeFilter === "" ? "default" : "outline", size: "sm", onClick: () => setTypeFilter(""), children: "Tous" }), _jsxs(Button, { variant: typeFilter === "IN" ? "default" : "outline", size: "sm", onClick: () => setTypeFilter("IN"), children: [_jsx(ArrowDownLeft, { className: "mr-1 h-4 w-4" }), "Entr\u00E9es"] }), _jsxs(Button, { variant: typeFilter === "OUT" ? "default" : "outline", size: "sm", onClick: () => setTypeFilter("OUT"), children: [_jsx(ArrowUpRight, { className: "mr-1 h-4 w-4" }), "Sorties"] })] })] }) }), _jsx("div", { className: "p-0", children: movementsLoading ? (_jsx("div", { className: "flex h-48 items-center justify-center text-sm text-muted-foreground", children: t("common.loading") })) : filteredMovements.length === 0 ? (_jsx(EmptyState, { icon: Package, title: t("stock.empty") || "Aucun mouvement", description: "Les mouvements de stock appara\u00EEtront ici" })) : (_jsx("div", { className: "divide-y", children: filteredMovements.map((m) => {
                                            const config = getMovementTypeConfig(m.type);
                                            const Icon = config.icon;
                                            return (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-full ${m.type === "IN"
                                                                    ? "bg-green-100 dark:bg-green-900/30"
                                                                    : m.type === "OUT"
                                                                        ? "bg-red-100 dark:bg-red-900/30"
                                                                        : "bg-amber-100 dark:bg-amber-900/30"}`, children: _jsx(Icon, { className: `h-5 w-5 ${m.type === "IN"
                                                                        ? "text-green-600"
                                                                        : m.type === "OUT"
                                                                            ? "text-red-600"
                                                                            : "text-amber-600"}` }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: getProductName(m.productId) }), _jsx("p", { className: "text-sm text-muted-foreground", children: formatDate(m.createdAt) })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: config.badgeVariant, size: "sm", children: config.label }), _jsxs("span", { className: `text-lg font-semibold ${m.type === "IN"
                                                                    ? "text-green-600"
                                                                    : m.type === "OUT"
                                                                        ? "text-red-600"
                                                                        : "text-amber-600"}`, children: [m.type === "IN" ? "+" : m.type === "OUT" ? "-" : "", m.quantity] })] })] }, m.id));
                                        }) })) })] }) }), _jsx(TabsContent, { value: "alerts", className: "mt-6", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: alertsLoading ? (_jsx("div", { className: "flex h-48 items-center justify-center text-sm text-muted-foreground", children: t("common.loading") })) : filteredAlerts.length === 0 ? (_jsx(EmptyState, { icon: AlertTriangle, title: "Aucune alerte de stock", description: "Tous vos stocks sont au-dessus du minimum" })) : (_jsx("div", { className: "divide-y", children: filteredAlerts.map((alert) => {
                                        const shortage = Math.max(0, alert.stockMin - alert.stockQuantity);
                                        return (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: alert.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Stock actuel : ", alert.stockQuantity] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Minimum" }), _jsx("p", { className: "font-medium", children: alert.stockMin })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Manquant" }), _jsx("p", { className: "font-semibold text-red-600", children: shortage })] })] })] }, alert.productId));
                                    }) })) }) }) })] }), _jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: t("stock.adjust") }) }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("stock.product") }), _jsxs("select", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value: form.productId, onChange: (e) => setForm({ ...form, productId: e.target.value }), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un produit" }), products?.data.map((p) => (_jsxs("option", { value: p.id, children: [p.name, " (", p.stockQuantity, " en stock)"] }, p.id)))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("stock.movement") }), _jsxs("select", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value }), children: [_jsx("option", { value: "IN", children: t("stock.in") }), _jsx("option", { value: "OUT", children: t("stock.out") })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("stock.quantity") }), _jsx(Input, { type: "number", value: form.quantity, onChange: (e) => setForm({ ...form, quantity: +e.target.value }) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), children: t("common.cancel") }), _jsx(Button, { onClick: handleSubmit, disabled: adjustStock.isPending, children: t("common.confirm") })] })] }) })] }));
}
