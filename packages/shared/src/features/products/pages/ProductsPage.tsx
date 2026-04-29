import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "../hooks/use-products";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import {
  DataTable,
  type Column,
  RowActions,
} from "../../../components/ui/data-table";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import {
  MoreVertical,
  Search,
  Plus,
  Trash2,
  Edit,
  Filter,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import type { Product } from "../types";
import { usePageTitle } from "../../../hooks/use-page-title";
import { formatCurrency } from "../../../lib/format";

export function ProductsPage() {
  usePageTitle("Produits");
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct;
  const deleteProduct = useDeleteProduct();
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    sellingPrice: 0,
    purchasePrice: 0,
    taxRate: 18,
    unit: "Unité",
    stockQuantity: 0,
    stockMin: 0,
    isService: false,
    isActive: true,
  });

  const filtered = products?.data.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStock =
      stockFilter === "" ||
      (stockFilter === "low" && p.stockQuantity <= p.stockMin) ||
      (stockFilter === "out" && p.stockQuantity === 0) ||
      (stockFilter === "ok" && p.stockQuantity > p.stockMin);
    return matchesSearch && matchesStock;
  }) ?? [];

  const handleSubmit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id).mutate(form as any, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingProduct(null);
        },
      });
    } else {
      createProduct.mutate(form as any, {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({
            code: "",
            name: "",
            description: "",
            sellingPrice: 0,
            purchasePrice: 0,
            taxRate: 18,
            unit: "Unité",
            stockQuantity: 0,
            stockMin: 0,
            isService: false,
            isActive: true,
          });
        },
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      code: product.code,
      name: product.name,
      description: product.description || "",
      sellingPrice: product.sellingPrice,
      purchasePrice: product.purchasePrice,
      taxRate: product.taxRate,
      unit: product.unit,
      stockQuantity: product.stockQuantity,
      stockMin: product.stockMin,
      isService: product.isService,
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const getStockStatus = (product: Product): { label: string; variant: "success" | "warning" | "destructive" } => {
    if (product.stockQuantity === 0) {
      return { label: "Rupture", variant: "destructive" };
    }
    if (product.stockQuantity <= product.stockMin) {
      return { label: "Stock faible", variant: "warning" };
    }
    return { label: "En stock", variant: "success" };
  };

  const columns: Column<(typeof filtered)[0]>[] = [
    {
      key: "code",
      label: t("products.code"),
      sortable: true,
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      key: "name",
      label: t("products.name"),
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "sellingPrice",
      label: t("products.sellingPrice"),
      sortable: true,
      align: "right",
      render: (value: number) => (
        <span className="text-sm font-medium text-right">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "stock",
      label: t("products.stock"),
      sortable: true,
      align: "right",
      render: (_: unknown, row: Product) => {
        const status = getStockStatus(row);
        return (
          <div className="flex items-center justify-end gap-2">
            {row.stockQuantity <= row.stockMin && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-sm">{row.stockQuantity}</span>
            <Badge variant={status.variant} size="sm">{status.label}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("products.title")}
        description={`${filtered.length} produit${filtered.length > 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("products.add")}
          </Button>
        }
      />

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Stock
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStockFilter("")}>
                  Tous
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStockFilter("ok")}>
                  Normal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStockFilter("low")}>
                  Stock faible
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStockFilter("out")}>
                  Rupture
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <DataTable
          data={filtered}
          columns={columns}
          isLoading={isLoading}
          emptyState={
            <EmptyState
              icon={Package}
              title={t("products.empty")}
              description="Commencez par ajouter un nouveau produit"
              action={{
                label: t("products.add"),
                onClick: () => setDialogOpen(true),
              }}
            />
          }
          actions={(row) => (
            <RowActions
              items={[
                {
                  label: t("common.edit"),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => handleEdit(row),
                },
                {
                  label: t("common.delete"),
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  onClick: () => deleteProduct.mutate(row.id),
                },
              ]}
            />
          )}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t("products.edit") : t("products.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.code")}</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.unit")}</label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("products.name")}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.sellingPrice")}</label>
                <Input
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.purchasePrice")}</label>
                <Input
                  type="number"
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.taxRate")}</label>
                <Input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: +e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.stock")}</label>
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("products.minStock")}</label>
                <Input
                  type="number"
                  value={form.stockMin}
                  onChange={(e) => setForm({ ...form, stockMin: +e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
