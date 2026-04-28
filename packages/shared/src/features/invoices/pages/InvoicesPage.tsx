import { useState } from "react";
import { useInvoices, useCreateInvoice, useDeleteInvoice } from "../hooks/use-invoices";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useI18n } from "../../../lib/i18n";
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
} from "lucide-react";
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
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", type: "INVOICE" as const });

  const filtered = invoices?.data.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      getCustomerName(inv.customerId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesType = !typeFilter || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) ?? [];

  const handleSubmit = () => {
    createInvoice.mutate(form as any, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ customerId: "", type: "INVOICE" });
      },
    });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers?.data.find((c) => c.id === customerId);
    return customer?.denomination || "-";
  };

  const columns: Column<(typeof filtered)[0]>[] = [
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("invoices.title")}
        description={`${filtered.length} facture${filtered.length > 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
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
              icon={<FileText className="h-8 w-8" />}
              title={t("invoices.empty")}
              description="Commencez par créer une nouvelle facture"
              action={{
                label: t("invoices.add"),
                onClick: () => setDialogOpen(true),
              }}
            />
          }
          actions={(row) => (
            <RowActions
              items={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Navigate to invoice details
                    console.log("View invoice:", row.id);
                  },
                },
                {
                  label: "Télécharger",
                  icon: <Download className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Download invoice PDF
                    console.log("Download invoice:", row.id);
                  },
                },
                {
                  label: t("common.delete"),
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  onClick: () => deleteInvoice.mutate(row.id),
                },
              ]}
            />
          )}
        />
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("invoices.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("invoices.customer")}</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              >
                <option value="">Sélectionner un client</option>
                {customers?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.denomination}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={createInvoice.isPending}>
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
