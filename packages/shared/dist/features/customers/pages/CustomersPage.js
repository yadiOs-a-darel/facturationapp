import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCustomers, useCreateCustomer, useDeleteCustomer, useUpdateCustomer, } from "../hooks/use-customers";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "../../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { DataTable, RowActions, } from "../../../components/ui/data-table";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import { Search, Plus, Trash2, Edit, Filter, Users } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import { usePageTitle } from "../../../hooks/use-page-title";
export function CustomersPage() {
    usePageTitle("Clients");
    const { data: customers, isLoading } = useCustomers();
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer;
    const deleteCustomer = useDeleteCustomer();
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form, setForm] = useState({
        code: "",
        denomination: "",
        email: "",
        phone: "",
        type: "RETAIL",
        country: "DZ",
    });
    const filtered = customers?.data.filter((c) => {
        const matchesSearch = !search ||
            c.denomination.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || c.type === typeFilter;
        return matchesSearch && matchesType;
    }) ?? [];
    const handleSubmit = () => {
        if (editingCustomer) {
            updateCustomer(editingCustomer.id).mutate(form, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingCustomer(null);
                    setForm({ code: "", denomination: "", email: "", phone: "", type: "RETAIL", country: "DZ" });
                },
            });
        }
        else {
            createCustomer.mutate(form, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setForm({ code: "", denomination: "", email: "", phone: "", type: "RETAIL", country: "DZ" });
                },
            });
        }
    };
    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setForm({
            code: customer.code,
            denomination: customer.denomination,
            email: customer.email || "",
            phone: customer.phone || "",
            type: customer.type,
            country: customer.country,
        });
        setDialogOpen(true);
    };
    const handleClose = () => {
        setDialogOpen(false);
        setEditingCustomer(null);
        setForm({ code: "", denomination: "", email: "", phone: "", type: "RETAIL", country: "DZ" });
    };
    const getTypeBadgeVariant = (type) => {
        switch (type) {
            case "RETAIL": return "default";
            case "WHOLESALE": return "secondary";
            default: return "outline";
        }
    };
    const getTypeLabel = (type) => {
        const labels = {
            RETAIL: t("customers.types.RETAIL"),
            WHOLESALE: t("customers.types.WHOLESALE"),
        };
        return labels[type] || type;
    };
    const columns = [
        {
            key: "code",
            label: t("customers.code"),
            sortable: true,
            render: (value) => _jsx("span", { className: "text-sm", children: value }),
        },
        {
            key: "denomination",
            label: t("customers.denomination"),
            sortable: true,
            render: (value) => _jsx("span", { className: "text-sm font-medium", children: value }),
        },
        {
            key: "type",
            label: t("customers.type"),
            sortable: true,
            render: (value) => (_jsx(Badge, { variant: getTypeBadgeVariant(value), size: "sm", children: getTypeLabel(value) })),
        },
        {
            key: "phone",
            label: t("common.phone"),
            sortable: true,
            render: (value) => (_jsx("span", { className: "text-sm text-muted-foreground", children: value || "-" })),
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t("customers.title"), description: `${filtered.length} client${filtered.length > 1 ? "s" : ""}`, action: _jsxs(Button, { onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), t("customers.add")] }) }), _jsxs(Card, { children: [_jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("common.search"), className: "pl-9" })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), typeFilter ? getTypeLabel(typeFilter) : "Type"] }) }), _jsxs(DropdownMenuContent, { children: [_jsx(DropdownMenuItem, { onClick: () => setTypeFilter(""), children: "Tous les types" }), _jsx(DropdownMenuItem, { onClick: () => setTypeFilter("RETAIL"), children: t("customers.types.RETAIL") }), _jsx(DropdownMenuItem, { onClick: () => setTypeFilter("WHOLESALE"), children: t("customers.types.WHOLESALE") })] })] })] }) }), _jsx(DataTable, { data: filtered, columns: columns, isLoading: isLoading, emptyState: _jsx(EmptyState, { icon: _jsx(Users, { className: "h-8 w-8" }), title: t("customers.empty"), description: "Commencez par ajouter un nouveau client", action: {
                                label: t("customers.add"),
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
                                    onClick: () => deleteCustomer.mutate(row.id),
                                },
                            ] })) })] }), _jsx(Dialog, { open: dialogOpen, onOpenChange: (open) => !open && handleClose(), children: _jsxs(DialogContent, { className: "sm:max-w-lg", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: editingCustomer ? t("customers.update") : t("customers.add") }) }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("customers.code") }), _jsx(Input, { value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("customers.type") }), _jsxs("select", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value }), children: [_jsx("option", { value: "RETAIL", children: t("customers.types.RETAIL") }), _jsx("option", { value: "WHOLESALE", children: t("customers.types.WHOLESALE") })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("customers.denomination") }), _jsx(Input, { value: form.denomination, onChange: (e) => setForm({ ...form, denomination: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Email" }), _jsx(Input, { value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("common.phone") }), _jsx(Input, { value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: handleClose, children: t("common.cancel") }), _jsx(Button, { onClick: handleSubmit, disabled: createCustomer.isPending, children: editingCustomer ? t("common.update") : t("common.create") })] })] }) })] }));
}
