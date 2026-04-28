import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useInvoices, useCreateInvoice, useDeleteInvoice } from "../hooks/use-invoices";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useI18n } from "../../../lib/i18n";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "../../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../../../components/ui/dropdown-menu";
import { DataTable, StatusBadge, RowActions, } from "../../../components/ui/data-table";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import { Search, Trash2, Plus, FileText, Filter, Download, Eye, } from "lucide-react";
import { usePageTitle } from "../../../hooks/use-page-title";
import { formatCurrency } from "../../../lib/format";
function formatDate(date) {
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
export function InvoicesPage() {
    usePageTitle("Factures");
    const { data: invoices, isLoading } = useInvoices();
    const { data: customers } = useCustomers();
    const createInvoice = useCreateInvoice();
    const deleteInvoice = useDeleteInvoice();
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ customerId: "", type: "INVOICE" });
    const filtered = invoices?.data.filter((inv) => {
        const matchesSearch = !search ||
            inv.number.toLowerCase().includes(search.toLowerCase()) ||
            getCustomerName(inv.customerId).toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || inv.status === statusFilter;
        const matchesType = !typeFilter || inv.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }) ?? [];
    const handleSubmit = () => {
        createInvoice.mutate(form, {
            onSuccess: () => {
                setDialogOpen(false);
                setForm({ customerId: "", type: "INVOICE" });
            },
        });
    };
    const getCustomerName = (customerId) => {
        const customer = customers?.data.find((c) => c.id === customerId);
        return customer?.denomination || "-";
    };
    const columns = [
        {
            key: "number",
            label: "Numéro",
            sortable: true,
            render: (value) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "font-medium", children: value })] })),
        },
        {
            key: "customer",
            label: "Client",
            sortable: true,
            render: (_, row) => (_jsx("span", { className: "text-sm", children: getCustomerName(row.customerId) })),
        },
        {
            key: "issueDate",
            label: "Date d'émission",
            sortable: true,
            render: (value) => (_jsx("span", { className: "text-sm text-muted-foreground", children: formatDate(value) })),
        },
        {
            key: "totalTTC",
            label: "Total TTC",
            sortable: true,
            align: "right",
            render: (value) => (_jsx("span", { className: "text-sm font-medium text-right", children: formatCurrency(value) })),
        },
        {
            key: "status",
            label: "Statut",
            sortable: true,
            render: (value) => _jsx(StatusBadge, { status: value }),
        },
    ];
    const getStatusLabel = (status) => {
        const labels = {
            DRAFT: "Brouillon",
            SENT: "Envoyée",
            PAID: "Payée",
            OVERDUE: "En retard",
        };
        return labels[status] || status;
    };
    const getTypeLabel = (type) => {
        const labels = {
            INVOICE: "Facture",
            PROFORMA: "Proforma",
            QUOTE: "Devis",
        };
        return labels[type] || type;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t("invoices.title"), description: `${filtered.length} facture${filtered.length > 1 ? "s" : ""}`, action: _jsxs(Button, { onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), t("invoices.add")] }) }), _jsxs(Card, { children: [_jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("common.search"), className: "pl-9" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), statusFilter ? getStatusLabel(statusFilter) : "Statut"] }) }), _jsxs(DropdownMenuContent, { children: [_jsx(DropdownMenuItem, { onClick: () => setStatusFilter(""), children: "Tous les statuts" }), _jsx(DropdownMenuItem, { onClick: () => setStatusFilter("DRAFT"), children: "Brouillon" }), _jsx(DropdownMenuItem, { onClick: () => setStatusFilter("SENT"), children: "Envoy\u00E9e" }), _jsx(DropdownMenuItem, { onClick: () => setStatusFilter("PAID"), children: "Pay\u00E9e" }), _jsx(DropdownMenuItem, { onClick: () => setStatusFilter("OVERDUE"), children: "En retard" })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), typeFilter ? getTypeLabel(typeFilter) : "Type"] }) }), _jsxs(DropdownMenuContent, { children: [_jsx(DropdownMenuItem, { onClick: () => setTypeFilter(""), children: "Tous les types" }), _jsx(DropdownMenuItem, { onClick: () => setTypeFilter("INVOICE"), children: "Facture" }), _jsx(DropdownMenuItem, { onClick: () => setTypeFilter("PROFORMA"), children: "Proforma" }), _jsx(DropdownMenuItem, { onClick: () => setTypeFilter("QUOTE"), children: "Devis" })] })] })] })] }) }), _jsx(DataTable, { data: filtered, columns: columns, isLoading: isLoading, emptyState: _jsx(EmptyState, { icon: _jsx(FileText, { className: "h-8 w-8" }), title: t("invoices.empty"), description: "Commencez par cr\u00E9er une nouvelle facture", action: {
                                label: t("invoices.add"),
                                onClick: () => setDialogOpen(true),
                            } }), actions: (row) => (_jsx(RowActions, { items: [
                                {
                                    label: "Voir",
                                    icon: _jsx(Eye, { className: "h-4 w-4" }),
                                    onClick: () => {
                                        // TODO: Navigate to invoice details
                                        console.log("View invoice:", row.id);
                                    },
                                },
                                {
                                    label: "Télécharger",
                                    icon: _jsx(Download, { className: "h-4 w-4" }),
                                    onClick: () => {
                                        // TODO: Download invoice PDF
                                        console.log("Download invoice:", row.id);
                                    },
                                },
                                {
                                    label: t("common.delete"),
                                    icon: _jsx(Trash2, { className: "h-4 w-4" }),
                                    destructive: true,
                                    onClick: () => deleteInvoice.mutate(row.id),
                                },
                            ] })) })] }), _jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: t("invoices.add") }) }), _jsx("div", { className: "space-y-4 py-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: t("invoices.customer") }), _jsxs("select", { className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", value: form.customerId, onChange: (e) => setForm({ ...form, customerId: e.target.value }), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un client" }), customers?.data.map((c) => (_jsx("option", { value: c.id, children: c.denomination }, c.id)))] })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), children: t("common.cancel") }), _jsx(Button, { onClick: handleSubmit, disabled: createInvoice.isPending, children: t("common.create") })] })] }) })] }));
}
