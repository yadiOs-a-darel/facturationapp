import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useInvoices,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoice,
  useUpdateInvoice,
  useCancelInvoice,
} from "../hooks/use-invoices";
import { InvoicePrintView } from "../components/InvoicePrintView";
import { printInvoice, downloadInvoicePdf, invoiceDetailToPrintData } from "../lib/print-invoice";
import { Checkbox } from "../../../components/ui/checkbox";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useProducts } from "../../products/hooks/use-products";
import { usePaymentMethods } from "../../payment-methods/hooks/use-payment-methods";
import { useI18n } from "../../../lib/i18n";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { InvoiceType, InvoiceUpsertPayload } from "../types";
import type { PaymentMethod } from "../../payment-methods/types";
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
  StatusBadge,
  RowActions,
} from "../../../components/ui/data-table";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/layout/page-header";
import {
  MoreVertical,
  Search,
  Trash2,
  Plus,
  FileText,
  Filter,
  Download,
  Eye,
  Edit,
  Ban,
  Printer,
} from "lucide-react";
import type { InvoiceStatus } from "../types";
import { fetchInvoice } from "../api/client";
import { usePageTitle } from "../../../hooks/use-page-title";
import { formatCurrency } from "../../../lib/format";

function formatDate(date: string): string {
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
  const { data: products } = useProducts();
  const { data: paymentMethods } = usePaymentMethods();
  const customersList = customers?.data ?? [];
  const productsList = products?.data ?? [];
  const paymentMethodsList: PaymentMethod[] = paymentMethods ?? [];
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const updateInvoice = useUpdateInvoice(editingInvoiceId ?? "");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const { data: invoiceData, isLoading: invoiceLoading } = useInvoice(viewInvoiceId ?? undefined);
  type InvoiceFormItem = {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
    taxRate: number;
  };

  const emptyForm = () => ({
    customerId: "",
    type: "INVOICE" as InvoiceType,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentMethod: "",
    paymentRef: "",
    markAsPaid: false,
    isBackdated: false,
    notes: "",
    terms: "",
    items: [] as InvoiceFormItem[],
  });

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!viewDialogOpen) {
      setViewInvoiceId(null);
    }
  }, [viewDialogOpen]);

  useEffect(() => {
    if (dialogOpen && !editingInvoiceId) {
      setForm(emptyForm());
    }
  }, [dialogOpen, editingInvoiceId]);

  const EDITABLE_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PARTIAL", "OVERDUE"];

  const isInvoiceEditable = (status: string) => EDITABLE_STATUSES.includes(status as InvoiceStatus);

  const openCreateDialog = () => {
    setEditingInvoiceId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const filtered = invoices?.data.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      getCustomerName(inv.customerId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesType = !typeFilter || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) ?? [];

  const buildPayload = (): InvoiceUpsertPayload => ({
    customerId: form.customerId || undefined,
    type: form.type,
    issueDate: form.issueDate,
    dueDate: form.dueDate || null,
    paymentMethod: form.markAsPaid ? form.paymentMethod || null : form.paymentMethod || null,
    paymentRef: form.paymentRef.trim() || null,
    markAsPaid: editingInvoiceId ? undefined : form.markAsPaid,
    isBackdated: form.isBackdated,
    notes: form.notes.trim() || null,
    terms: form.terms.trim() || null,
    items: form.items.map((item) => ({
      productId: item.productId || undefined,
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: item.discountRate,
      taxRate: item.taxRate,
    })),
  });

  const handleSubmit = () => {
    const validItems = form.items.filter((item) => item.description.trim().length > 0);
    if (validItems.length === 0) {
      toast.error(t("invoices.validation.itemsRequired"));
      return;
    }

    if (!editingInvoiceId && form.markAsPaid && !form.paymentMethod) {
      toast.error("Sélectionnez un mode de paiement pour valider le paiement");
      return;
    }

    const payload = buildPayload();

    if (editingInvoiceId) {
      updateInvoice.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingInvoiceId(null);
          setForm(emptyForm());
        },
      });
      return;
    }

    createInvoice.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm(emptyForm());
      },
    });
  };
  const getCustomerName = (customerId: string) => {
    const customer = customersList.find((c) => c.id === customerId);
    return customer?.denomination || "-";
  };

  const getProductName = (productId: string | undefined) => {
    if (!productId) return "";
    const product = productsList.find((p) => p.id === productId);
    return product ? product.name : "";
  };

  const getPaymentMethodLabel = (methodCode: string) => {
    const method = paymentMethodsList.find((m) => m.code === methodCode || m.id === methodCode);
    return method ? method.label : methodCode;
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          discountRate: 0,
          taxRate: 19,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const updateItem = (index: number, field: keyof InvoiceFormItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = productsList.find((p) => p.id === productId);
    setForm((prev) => {
      const items = [...prev.items];
      const current = items[index];
      items[index] = {
        ...current,
        productId: productId || undefined,
        description: product?.name ?? current.description,
        unitPrice: product ? Number(product.sellingPrice) : current.unitPrice,
        taxRate: product ? Number(product.taxRate) || 19 : current.taxRate,
      };
      return { ...prev, items };
    });
  };

  type InvoicesRow = (typeof filtered)[0];
  const columns: Column<InvoicesRow>[] = [
    {
      key: "number",
      label: "Numéro",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Client",
      sortable: true,
      render: (_: unknown, row: (typeof filtered)[0]) => (
        <span className="text-sm">{getCustomerName(row.customerId)}</span>
      ),
    },
    {
      key: "issueDate",
      label: "Date d'émission",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{formatDate(value)}</span>
      ),
    },
    {
      key: "totalTTC",
      label: "Total TTC",
      sortable: true,
      align: "right",
      render: (value: number) => (
        <span className="text-sm font-medium text-right">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      DRAFT: "Brouillon",
      SENT: "Envoyée",
      PAID: "Payée",
      OVERDUE: "En retard",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      INVOICE: "Facture",
      PROFORMA: "Proforma",
      QUOTE: "Devis",
    };
    return labels[type] || type;
  };

  const handleViewInvoice = (id: string) => {
    setViewInvoiceId(id);
    setViewDialogOpen(true);
  };

  const handlePrintInvoice = (invoice: NonNullable<typeof invoiceData>) => {
    const printData = invoiceDetailToPrintData(invoice, getPaymentMethodLabel(invoice.paymentMethod ?? ""));
    printInvoice(printData);
  };

  const handleDownloadInvoice = (invoice: NonNullable<typeof invoiceData>) => {
    const printData = invoiceDetailToPrintData(invoice, getPaymentMethodLabel(invoice.paymentMethod ?? ""));
    downloadInvoicePdf(printData);
  };

  const handleEditInvoice = async (id: string) => {
    setViewDialogOpen(false);
    setEditingInvoiceId(id);
    try {
      const inv = await fetchInvoice(id);
      if (!isInvoiceEditable(inv.status)) {
        toast.error("Cette facture ne peut plus être modifiée");
        setEditingInvoiceId(null);
        return;
      }
      setForm({
        customerId: inv.customerId,
        type: inv.type,
        issueDate: inv.issueDate.split("T")[0],
        dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
        paymentMethod: inv.paymentMethod ?? "",
        paymentRef: inv.paymentRef ?? "",
        markAsPaid: false,
        isBackdated: inv.isBackdated,
        notes: inv.notes ?? "",
        terms: inv.terms ?? "",
        items: (inv.items ?? []).map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountRate: Number(item.discountRate ?? 0),
          taxRate: Number(item.taxRate ?? 19),
        })),
      });
      setDialogOpen(true);
    } catch {
      toast.error("Impossible de charger la facture");
      setEditingInvoiceId(null);
    }
  };

  const handleCancelInvoice = (id: string) => {
    if (!confirm("Annuler cette facture ? Les mouvements de stock seront restaurés.")) return;
    cancelInvoice.mutate(id, {
      onSuccess: () => setViewDialogOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("invoices.title")}
        description={`${filtered.length} facture${filtered.length > 1 ? "s" : ""}`}
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t("invoices.add")}
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

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? getStatusLabel(statusFilter) : "Statut"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("")}>
                    Tous les statuts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>
                    Brouillon
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("SENT")}>
                    Envoyée
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PAID")}>
                    Payée
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("OVERDUE")}>
                    En retard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {typeFilter ? getTypeLabel(typeFilter) : "Type"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("")}>
                    Tous les types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("INVOICE")}>
                    Facture
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("PROFORMA")}>
                    Proforma
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("QUOTE")}>
                    Devis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>

        <DataTable
          data={filtered}
          columns={columns}
          isLoading={isLoading}
          emptyState={
            <EmptyState
              icon={FileText}
              title={t("invoices.empty")}
              description="Commencez par créer une nouvelle facture"
              action={{
                label: t("invoices.add"),
                onClick: openCreateDialog,
              }}
            />
          }
          actions={(row) => (
            <RowActions
              items={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => handleViewInvoice(row.id),
                },
                ...(isInvoiceEditable(row.status)
                  ? [
                      {
                        label: t("common.edit"),
                        icon: <Edit className="h-4 w-4" />,
                        onClick: () => handleEditInvoice(row.id),
                      },
                    ]
                  : []),
                ...(row.status !== "CANCELLED"
                  ? [
                      {
                        label: "Annuler",
                        icon: <Ban className="h-4 w-4" />,
                        onClick: () => handleCancelInvoice(row.id),
                      },
                    ]
                  : []),
                ...(row.status !== "PAID" && row.status !== "PARTIAL"
                  ? [
                      {
                        label: t("common.delete"),
                        icon: <Trash2 className="h-4 w-4" />,
                        destructive: true,
                        onClick: () => deleteInvoice.mutate(row.id),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        />
      </Card>

      {/* Create/Edit Invoice Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingInvoiceId(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoiceId ? "Modifier la facture" : t("invoices.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.customer")}</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                >
                  <option value="">{t("invoices.selectCustomer")}</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.denomination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.type")}</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as InvoiceType })}
                >
                  <option value="INVOICE">{t("invoices.types.INVOICE")}</option>
                  <option value="PROFORMA">{t("invoices.types.PROFORMA")}</option>
                  <option value="QUOTE">{t("invoices.types.QUOTE")}</option>
                  <option value="DELIVERY_NOTE">{t("invoices.types.DELIVERY_NOTE")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.date")}</label>
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.dueDate")}</label>
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{t("invoices.paymentMethod")}</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  <option value="">{t("invoices.selectPaymentMethod")}</option>
                  {paymentMethodsList.map((pm) => (
                    <option key={pm.id} value={pm.code}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>

              {!editingInvoiceId && (
                <div className="md:col-span-2 space-y-4 rounded-lg border p-4 bg-muted/20">
                  <p className="text-sm font-medium">Paiement</p>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="paymentTiming" checked={!form.markAsPaid} onChange={() => setForm({ ...form, markAsPaid: false })} />
                      Laisser impayée (règlement ultérieur)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="paymentTiming" checked={form.markAsPaid} onChange={() => setForm({ ...form, markAsPaid: true })} />
                      Valider le paiement maintenant
                    </label>
                  </div>
                  {form.markAsPaid && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Référence de paiement</label>
                      <Input value={form.paymentRef} onChange={(e) => setForm({ ...form, paymentRef: e.target.value })} placeholder="N° chèque, transaction..." />
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-2">
                <Checkbox id="isBackdated" checked={form.isBackdated} onCheckedChange={(checked) => setForm({ ...form, isBackdated: checked === true })} />
                <label htmlFor="isBackdated" className="text-sm cursor-pointer">Antidater cette facture (date d'émission dans le passé)</label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.notes")}</label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("common.notes")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.terms")}</label>
                <Textarea
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  placeholder={t("common.terms")}
                  rows={3}
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="border rounded p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{t("invoices.items")}</h3>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("invoices.addItem")}
                </Button>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className="border rounded p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-medium">
                      {t("invoices.item")} #{index + 1}
                    </h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("common.product")}</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={item.productId ?? ""}
                        onChange={(e) => handleProductSelect(index, e.target.value)}
                      >
                        <option value="">{t("invoices.selectProduct")}</option>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("invoices.description")}</label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("common.quantity")}</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseFloat(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("common.unitPrice")}</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("invoices.discountRate")}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discountRate}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "discountRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("invoices.taxRate")}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateItem(index, "taxRate", parseFloat(e.target.value) || 19)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              {form.items.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  {t("invoices.noItems")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (editingInvoiceId ? updateInvoice.isPending : createInvoice.isPending) ||
                form.items.length === 0
              }
              className="w-full md:w-auto"
            >
              {editingInvoiceId ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog — print-ready */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl sm:max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 print:hidden">
            <DialogTitle>{t("invoices.view")}</DialogTitle>
          </DialogHeader>
          {invoiceLoading ? (
            <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
          ) : invoiceData ? (
            <>
              <InvoicePrintView
                invoice={invoiceData}
                paymentMethodLabel={
                  invoiceData.paymentMethod
                    ? getPaymentMethodLabel(invoiceData.paymentMethod)
                    : undefined
                }
              />
              <DialogFooter className="px-6 pb-6 print:hidden flex-wrap gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  {t("common.close")}
                </Button>
                <Button variant="outline" onClick={() => handlePrintInvoice(invoiceData)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={() => handleDownloadInvoice(invoiceData)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
                {isInvoiceEditable(invoiceData.status) && (
                  <Button onClick={() => handleEditInvoice(invoiceData.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                )}
                {invoiceData.status !== "CANCELLED" && (
                  <Button variant="destructive" onClick={() => handleCancelInvoice(invoiceData.id)}>
                    <Ban className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("common.noData")}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  
}