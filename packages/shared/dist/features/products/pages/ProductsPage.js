import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct, } from "../hooks/use-products";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "../../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { DataTable, RowActions, } from "../../../components/ui/data-table";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import { Search, Plus, Trash2, Edit, Filter, AlertTriangle, Package, } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
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
    const [stockFilter, setStockFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase());
        const matchesStock = stockFilter === "" ||
            (stockFilter === "low" && p.stockQuantity <= p.stockMin) ||
            (stockFilter === "out" && p.stockQuantity === 0) ||
            (stockFilter === "ok" && p.stockQuantity > p.stockMin);
        return matchesSearch && matchesStock;
    }) ?? [];
    const handleSubmit = () => {
        if (editingProduct) {
            updateProduct(editingProduct.id).mutate(form, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingProduct(null);
                },
            });
        }
        else {
            createProduct.mutate(form, {
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
    const handleEdit = (product) => {
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
    const getStockStatus = (product) => {
        if (product.stockQuantity === 0) {
            return { label: "Rupture", variant: "destructive" };
        }
        if (product.stockQuantity <= product.stockMin) {
            return { label: "Stock faible", variant: "warning" };
        }
        return { label: "En stock", variant: "success" };
    };
    const columns = [
        {
            key: "code",
            label: t("products.code"),
            sortable: true,
            render: (value) => _jsx("span", { className: "text-sm", children: value }),
        },
        {
            key: "name",
            label: t("products.name"),
            sortable: true,
            render: (value, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm font-medium", children: value })] })),
        },
        {
            key: "sellingPrice",
            label: t("products.sellingPrice"),
            sortable: true,
            align: "right",
            render: (value) => (_jsx("span", { className: "text-sm font-medium text-right", children: formatCurrency(value) })),
        },
        {
            key: "stock",
            label: t("products.stock"),
            sortable: true,
            align: "right",
            render: (_, row) => {
                const status = getStockStatus(row);
                return (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [row.stockQuantity <= row.stockMin && (_jsx(AlertTriangle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: row.stockQuantity }), _jsx(Badge, { variant: status.variant, size: "sm", children: status.label })] }));
            },
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t("products.title"), description: `${filtered.length} produit${filtered.length > 1 ? "s" : ""}`, action: _jsxs(Button, { onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), t("products.add")] }) }), _jsxs(Card, { children: [_jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("common.search"), className: "pl-9" })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), "Stock"] }) }), _jsxs(DropdownMenuContent, { children: [_jsx(DropdownMenuItem, { onClick: () => setStockFilter(""), children: "Tous" }), _jsx(DropdownMenuItem, { onClick: () => setStockFilter("ok"), children: "Normal" }), _jsx(DropdownMenuItem, { onClick: () => setStockFilter("low"), children: "Stock faible" }), _jsx(DropdownMenuItem, { onClick: () => setStockFilter("out"), children: "Rupture" })] })] })] }) }), _jsx(DataTable, { data: filtered, columns: columns, isLoading: isLoading, emptyState: _jsx(EmptyState, { icon: _jsx(Package, { className: "h-8 w-8" }), title: t("products.empty"), description: "Commencez par ajouter un nouveau produit", action: {
                                label: t("products.add"),
                                onClick: () => setDialogOpen(true),
                            } }), actions: (row) => (_jsx(RowActions, { items: [
                                {
                                    label: t("common.edit"),
                                    icon: _jsx(Edit, { className: "h-4 w-4" }),
                                    onClick: () => handleEdit(row),
                                },
                                {
                                    label: t("common.delete"),
                                    icon: _jsx(Trash2, { className: "h-4 w-4" }),
                                    destructive: true,
                                    onClick: () => deleteProduct.mutate(row.id),
                                },
                            ] })) })] }), _jsx(Dialog, { open: dialogOpen, onOpenChange: (open) => !open && handleClose(), children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: editingProduct ? t("products.edit") : t("products.add") }) }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.code") }), _jsx(Input, { value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.unit") }), _jsx(Input, { value: form.unit, onChange: (e) => setForm({ ...form, unit: e.target.value }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.name") }), _jsx(Input, { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.sellingPrice") }), _jsx(Input, { type: "number", value: form.sellingPrice, onChange: (e) => setForm({ ...form, sellingPrice: +e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.purchasePrice") }), _jsx(Input, { type: "number", value: form.purchasePrice, onChange: (e) => setForm({ ...form, purchasePrice: +e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.taxRate") }), _jsx(Input, { type: "number", value: form.taxRate, onChange: (e) => setForm({ ...form, taxRate: +e.target.value }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.stock") }), _jsx(Input, { type: "number", value: form.stockQuantity, onChange: (e) => setForm({ ...form, stockQuantity: +e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("products.minStock") }), _jsx(Input, { type: "number", value: form.stockMin, onChange: (e) => setForm({ ...form, stockMin: +e.target.value }) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: handleClose, children: t("common.cancel") }), _jsx(Button, { onClick: handleSubmit, children: editingProduct ? t("common.update") : t("common.create") })] })] }) })] }));
}
