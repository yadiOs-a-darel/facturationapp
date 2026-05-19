import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useInvoices,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoice,
  useUpdateInvoice,
  useCancelInvoice,
  useRecordPayment,
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
import {
  computeFormTotalTTC,
  getRemainingAmount,
  resolveInvoiceStatus,
} from "../lib/invoice-status";
import {
  invoiceDateClass,
  invoiceItemCardClass,
  invoiceItemsSectionClass,
  invoicePaymentPanelClass,
  invoiceSelectClass,
  invoiceSummaryClass,
} from "../lib/invoice-ui";

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
  const recordPaymentMutation = useRecordPayment(viewInvoiceId ?? "");
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    methodCode: "",
    reference: "",
  });
  type InvoiceFormItem = {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
    taxRate: number;
  };

  type PaymentTiming = "later" | "now";
  type PaymentPreset = "full" | "half" | "custom";

  const emptyForm = () => ({
    customerId: "",
    type: "INVOICE" as InvoiceType,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentTiming: "later" as PaymentTiming,
    paymentPreset: "full" as PaymentPreset,
    initialPaymentAmount: 0,
    paymentMethod: "",
    paymentRef: "",
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
    if (!invoiceData) return;
    const remaining = getRemainingAmount(
      Number(invoiceData.totalTTC),
      Number(invoiceData.paidAmount),
    );
    setPaymentForm({ amount: remaining, methodCode: "", reference: "" });
  }, [invoiceData?.id, invoiceData?.paidAmount, invoiceData?.totalTTC]);

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
    const matchesStatus =
      !statusFilter || getInvoiceDisplayStatus(inv) === statusFilter;
    const matchesType = !typeFilter || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) ?? [];

  const formTotalTTC = computeFormTotalTTC(
    form.items.filter((item) => item.description.trim().length > 0),
  );

  const effectivePaymentAmount =
    form.paymentTiming === "later"
      ? 0
      : form.paymentPreset === "full"
        ? formTotalTTC
        : form.paymentPreset === "half"
          ? Math.round((formTotalTTC / 2) * 100) / 100
          : form.initialPaymentAmount;

  const previewStatus = resolveInvoiceStatus({
    paidAmount: effectivePaymentAmount,
    totalTTC: formTotalTTC,
    dueDate: form.dueDate || null,
  });

  const buildPayload = (): InvoiceUpsertPayload => ({
    customerId: form.customerId || undefined,
    type: form.type,
    issueDate: form.issueDate,
    dueDate: form.dueDate || null,
    paymentMethod: effectivePaymentAmount > 0 ? form.paymentMethod || null : null,
    paymentRef: effectivePaymentAmount > 0 ? form.paymentRef.trim() || null : null,
    initialPaymentAmount: editingInvoiceId ? undefined : effectivePaymentAmount,
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

    if (!editingInvoiceId && effectivePaymentAmount > 0 && !form.paymentMethod) {
      toast.error("Sélectionnez un mode de paiement pour enregistrer le versement");
      return;
    }

    if (
      !editingInvoiceId &&
      effectivePaymentAmount > 0 &&
      effectivePaymentAmount > formTotalTTC + 0.01
    ) {
      toast.error("Le montant versé ne peut pas dépasser le total TTC");
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
  const getCustomerName = (customerId?: string | null) => {
    if (!customerId) return "Sans client";
    const customer = customersList.find((c) => c.id === customerId);
    if (customer?.code === "WALKIN") return "Sans client";
    return customer?.denomination || "Sans client";
  };

  const getInvoiceDisplayStatus = (inv: {
    status: string;
    paidAmount: number;
    totalTTC: number;
    dueDate?: string | null;
  }) =>
    resolveInvoiceStatus({
      paidAmount: Number(inv.paidAmount),
      totalTTC: Number(inv.totalTTC),
      dueDate: inv.dueDate,
    });

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
      render: (_: unknown, row: InvoicesRow) => {
        const displayStatus = getInvoiceDisplayStatus(row);
        return (
          <StatusBadge
            status={displayStatus}
            labels={{
              DRAFT: t("invoices.status.DRAFT"),
              SENT: t("invoices.status.SENT"),
              PARTIAL: t("invoices.status.PARTIAL"),
              PAID: t("invoices.status.PAID"),
              OVERDUE: t("invoices.status.OVERDUE"),
              CANCELLED: t("invoices.status.CANCELLED"),
            }}
          />
        );
      },
    },
    {
      key: "paidAmount",
      label: "Paiement",
      align: "right",
      render: (_: unknown, row: InvoicesRow) => {
        const paid = Number(row.paidAmount);
        const total = Number(row.totalTTC);
        const remaining = getRemainingAmount(total, paid);
        if (paid >= total - 0.01) {
          return <span className="text-sm text-green-600 font-medium">Payé</span>;
        }
        if (paid > 0) {
          return (
            <span className="text-sm text-amber-600">
              Reste {formatCurrency(remaining)}
            </span>
          );
        }
        const status = getInvoiceDisplayStatus(row);
        if (status === "OVERDUE") {
          return <span className="text-sm text-destructive font-medium">Impayée</span>;
        }
        return <span className="text-sm text-muted-foreground">Impayée</span>;
      },
    },
  ];

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      DRAFT: t("invoices.status.DRAFT"),
      SENT: t("invoices.status.SENT"),
      PARTIAL: t("invoices.status.PARTIAL"),
      PAID: t("invoices.status.PAID"),
      OVERDUE: t("invoices.status.OVERDUE"),
      CANCELLED: t("invoices.status.CANCELLED"),
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
        customerId: inv.customerId && inv.customerId !== "" ? inv.customerId : "",
        type: inv.type,
        issueDate: inv.issueDate.split("T")[0],
        dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
        paymentTiming: "later",
        paymentPreset: "full",
        initialPaymentAmount: 0,
        paymentMethod: inv.paymentMethod ?? "",
        paymentRef: inv.paymentRef ?? "",
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
                    {t("invoices.status.SENT")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PARTIAL")}>
                    {t("invoices.status.PARTIAL")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PAID")}>
                    {t("invoices.status.PAID")}
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
        <DialogContent className="sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>
              {editingInvoiceId ? "Modifier la facture" : t("invoices.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="invoice-form space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("invoices.customer")}{" "}
                  <span className="text-muted-foreground font-normal">(facultatif)</span>
                </label>
                <select
                  className={invoiceSelectClass}
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                >
                  <option value="">{t("invoices.noCustomer")}</option>
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
                  className={invoiceSelectClass}
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
                  className={invoiceSelectClass}
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("invoices.dueDate")}</label>
                <input
                  type="date"
                  className={invoiceSelectClass}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              {!editingInvoiceId && (
                <div className={invoicePaymentPanelClass}>
                  <p className="text-sm font-medium">{t("invoices.paymentSection")}</p>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="paymentTiming" checked={form.paymentTiming === "later"} onChange={() => setForm({ ...form, paymentTiming: "later" })} />
                      {t("invoices.payLater")}
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="paymentTiming" checked={form.paymentTiming === "now"} onChange={() => setForm({ ...form, paymentTiming: "now", paymentPreset: "full" })} />
                      {t("invoices.payNow")}
                    </label>
                  </div>
                  {form.paymentTiming === "now" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={form.paymentPreset === "full" ? "default" : "outline"}
                          onClick={() =>
                            setForm({
                              ...form,
                              paymentPreset: "full",
                              initialPaymentAmount: formTotalTTC,
                            })
                          }
                        >
                          {t("invoices.payFull")} ({formatCurrency(formTotalTTC)})
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={form.paymentPreset === "half" ? "default" : "outline"}
                          onClick={() =>
                            setForm({
                              ...form,
                              paymentPreset: "half",
                              initialPaymentAmount:
                                Math.round((formTotalTTC / 2) * 100) / 100,
                            })
                          }
                        >
                          {t("invoices.payHalf")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={form.paymentPreset === "custom" ? "default" : "outline"}
                          onClick={() => setForm({ ...form, paymentPreset: "custom" })}
                        >
                          {t("invoices.payCustom")}
                        </Button>
                      </div>
                      {form.paymentPreset === "custom" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t("invoices.paymentAmount")}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            max={formTotalTTC}
                            value={form.initialPaymentAmount}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                initialPaymentAmount: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("invoices.paymentMethod")}
                        </label>
                        <select
                          className={invoiceSelectClass}
                          value={form.paymentMethod}
                          onChange={(e) =>
                            setForm({ ...form, paymentMethod: e.target.value })
                          }
                        >
                          <option value="">{t("invoices.selectPaymentMethod")}</option>
                          {paymentMethodsList.map((pm) => (
                            <option key={pm.id} value={pm.code}>
                              {pm.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("invoices.paymentRef")}
                        </label>
                        <Input
                          value={form.paymentRef}
                          onChange={(e) =>
                            setForm({ ...form, paymentRef: e.target.value })
                          }
                          placeholder="N° chèque, transaction..."
                        />
                      </div>
                    </div>
                  )}
                  {formTotalTTC > 0 && (
                    <div className={invoiceSummaryClass}>
                      <div className="flex justify-between">
                        <span>{t("invoices.totalTTC")}</span>
                        <span className="font-medium">{formatCurrency(formTotalTTC)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("invoices.paidAmount")}</span>
                        <span className="font-medium">
                          {formatCurrency(effectivePaymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("invoices.remainingAmount")}</span>
                        <span className="font-medium">
                          {formatCurrency(
                            getRemainingAmount(formTotalTTC, effectivePaymentAmount),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span>{t("invoices.status")}</span>
                        <StatusBadge
                          status={previewStatus}
                          labels={{
                            SENT: t("invoices.status.SENT"),
                            PARTIAL: t("invoices.status.PARTIAL"),
                            PAID: t("invoices.status.PAID"),
                            OVERDUE: t("invoices.status.OVERDUE"),
                          }}
                        />
                      </div>
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
            <div className={invoiceItemsSectionClass}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-primary/90">{t("invoices.items")}</h3>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("invoices.addItem")}
                </Button>
              </div>

              {form.items.map((item, index) => (
                <div key={index} className={invoiceItemCardClass}>
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
                        className={invoiceSelectClass}
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
        <DialogContent className="sm:max-w-4xl sm:max-h-[95vh] overflow-y-auto p-0 border-border/60 bg-background/95">
          <DialogHeader className="px-6 pt-6 print:hidden border-b border-border/40 bg-muted/30">
            <DialogTitle className="text-primary/90">{t("invoices.view")}</DialogTitle>
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
              {getRemainingAmount(
                Number(invoiceData.totalTTC),
                Number(invoiceData.paidAmount),
              ) > 0.01 &&
                invoiceData.status !== "CANCELLED" && (
                  <div className="invoice-form px-6 pb-4 print:hidden space-y-3 border-t border-border/50 bg-muted/20 pt-4">
                    <p className="text-sm font-medium">{t("invoices.recordPayment")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          {t("invoices.paymentAmount")}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          {t("invoices.paymentMethod")}
                        </label>
                        <select
                          className={invoiceSelectClass}
                          value={paymentForm.methodCode}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, methodCode: e.target.value })
                          }
                        >
                          <option value="">{t("invoices.selectPaymentMethod")}</option>
                          {paymentMethodsList.map((pm) => (
                            <option key={pm.id} value={pm.code}>
                              {pm.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          {t("invoices.paymentRef")}
                        </label>
                        <Input
                          value={paymentForm.reference}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, reference: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={recordPaymentMutation.isPending}
                      onClick={() => {
                        if (!paymentForm.methodCode) {
                          toast.error(t("invoices.selectPaymentMethod"));
                          return;
                        }
                        if (paymentForm.amount <= 0) {
                          toast.error(t("invoices.paymentAmountInvalid"));
                          return;
                        }
                        recordPaymentMutation.mutate({
                          amount: paymentForm.amount,
                          methodCode: paymentForm.methodCode,
                          reference: paymentForm.reference.trim() || null,
                        });
                      }}
                    >
                      {t("invoices.recordPayment")}
                    </Button>
                  </div>
                )}
              <DialogFooter className="px-6 pb-6 print:hidden flex-wrap gap-2">
                <Button variant="outline" onClick={() => handlePrintInvoice(invoiceData)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                {isInvoiceEditable(invoiceData.status) && (
                  <Button onClick={() => handleEditInvoice(invoiceData.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("common.edit")}
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