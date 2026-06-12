import { useState } from "react";
import { useStockMovements, useStockAlerts, useAdjustStock } from "../hooks/use-stock";
import { useProducts } from "../../products/hooks/use-products";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import {
  Search,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import { usePageTitle } from "../../../hooks/use-page-title";
import { useListPagination } from "../../../hooks/use-list-pagination";
import { ListPagination } from "../../../components/ui/list-pagination";
import { SELECT_LIST_LIMIT } from "../../../lib/pagination";
import type { MovementType } from "../types";

function formatDate(dateString: string) {
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [tab, setTab] = useState("movements");
  const { page, setPage, pageSize } = useListPagination([search, typeFilter]);
  const { page: alertsPage, setPage: setAlertsPage, pageSize: alertsPageSize } = useListPagination([tab]);
  const { data: movements, isLoading: movementsLoading } = useStockMovements({
    page,
    limit: pageSize,
    search: search || undefined,
    type: (typeFilter || undefined) as MovementType | undefined,
  });
  const { data: alerts, isLoading: alertsLoading } = useStockAlerts({
    page: alertsPage,
    limit: alertsPageSize,
  });
  const { data: products } = useProducts({ limit: SELECT_LIST_LIMIT });
  const adjustStock = useAdjustStock();
  const { t } = useI18n();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT",
    reason: "",
  });

  const movementRows = movements?.data ?? [];
  const movementsMeta = movements?.meta;
  const alertRows = alerts?.data ?? [];
  const alertsMeta = alerts?.meta;

  const handleSubmit = () => {
    adjustStock.mutate(form as any, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ productId: "", quantity: 0, type: "IN", reason: "" });
      },
    });
  };

  const getProductName = (productId: string) => {
    const product = products?.data.find((p) => p.id === productId);
    return product?.name || "Produit";
  };

  const getMovementTypeConfig = (type: string) => {
    switch (type) {
      case "IN":
        return {
          label: "Entrée",
          icon: ArrowDownLeft,
          badgeVariant: "success" as const,
        };
      case "OUT":
        return {
          label: "Sortie",
          icon: ArrowUpRight,
          badgeVariant: "destructive" as const,
        };
      default:
        return {
          label: "Ajustement",
          icon: Package,
          badgeVariant: "secondary" as const,
        };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("stock.title")}
        description={`${movementsMeta?.total ?? 0} mouvement${(movementsMeta?.total ?? 0) > 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("stock.adjust")}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="movements" className="gap-2">
            {t("stock.movements")}
            <Badge variant="secondary" size="sm">
              {movementsMeta?.total ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            {t("stock.alerts")}
            {(alertsMeta?.total ?? 0) > 0 && (
              <Badge variant="warning" size="sm">
                {alertsMeta?.total ?? 0}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("common.search")}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={typeFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("")}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={typeFilter === "IN" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("IN")}
                  >
                    <ArrowDownLeft className="mr-1 h-4 w-4" />
                    Entrées
                  </Button>
                  <Button
                    variant={typeFilter === "OUT" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter("OUT")}
                  >
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    Sorties
                  </Button>
                </div>
              </div>
            </CardContent>

            <div className="p-0">
              {movementsLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : movementRows.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={t("stock.empty") || "Aucun mouvement"}
                  description="Les mouvements de stock apparaîtront ici"
                />
              ) : (
                <div className="divide-y">
                  {movementRows.map((m) => {
                    const config = getMovementTypeConfig(m.type);
                    const Icon = config.icon;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              m.type === "IN"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : m.type === "OUT"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-amber-100 dark:bg-amber-900/30"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                m.type === "IN"
                                  ? "text-green-600"
                                  : m.type === "OUT"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{getProductName(m.productId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(m.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={config.badgeVariant} size="sm">
                            {config.label}
                          </Badge>
                          <span
                            className={`text-lg font-semibold ${
                              m.type === "IN"
                                ? "text-green-600"
                                : m.type === "OUT"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {m.type === "IN" ? "+" : m.type === "OUT" ? "-" : ""}
                            {m.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {movementsMeta && (
              <ListPagination
                page={movementsMeta.page}
                totalPages={movementsMeta.totalPages}
                total={movementsMeta.total}
                onPageChange={setPage}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {alertsLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : alertRows.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Aucune alerte de stock"
                  description="Tous vos stocks sont au-dessus du minimum"
                />
              ) : (
                <div className="divide-y">
                  {alertRows.map((alert) => {
                    const shortage = Math.max(0, alert.stockMin - alert.stockQuantity);
                    return (
                      <div
                        key={alert.productId}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{alert.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock actuel : {alert.stockQuantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Minimum</p>
                            <p className="font-medium">{alert.stockMin}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Manquant</p>
                            <p className="font-semibold text-red-600">{shortage}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            {alertsMeta && (
              <ListPagination
                page={alertsMeta.page}
                totalPages={alertsMeta.totalPages}
                total={alertsMeta.total}
                onPageChange={setAlertsPage}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("stock.adjust")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("stock.product")}</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Sélectionner un produit</option>
                {products?.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stockQuantity} en stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("stock.movement")}</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "IN" | "OUT" })
                  }
                >
                  <option value="IN">{t("stock.in")}</option>
                  <option value="OUT">{t("stock.out")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("stock.quantity")}</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={adjustStock.isPending}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
