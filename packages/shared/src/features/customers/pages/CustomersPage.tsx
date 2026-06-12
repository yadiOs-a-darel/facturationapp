import { useState } from "react";
import {
  useCustomers,
  useCreateCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/use-customers";
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
import { MoreVertical, Search, Plus, Trash2, Edit, Filter, Users } from "lucide-react";
import { useI18n } from "../../../lib/i18n";
import type { Customer } from "../types";
import { usePageTitle } from "../../../hooks/use-page-title";
import { useListPagination } from "../../../hooks/use-list-pagination";
import { ListPagination } from "../../../components/ui/list-pagination";

export function CustomersPage() {
  usePageTitle("Clients");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const { page, setPage, pageSize } = useListPagination([search, typeFilter]);
  const { data: customers, isLoading } = useCustomers({
    page,
    limit: pageSize,
    search: search || undefined,
    type: typeFilter || undefined,
  });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer;
  const deleteCustomer = useDeleteCustomer();
  const { t } = useI18n();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    code: "",
    denomination: "",
    email: "",
    phone: "",
    type: "RETAIL" as any,
    country: "DZ",
  });

  const customerRows = customers?.data ?? [];
  const listMeta = customers?.meta;

  const handleSubmit = () => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id).mutate(form as any, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingCustomer(null);
          setForm({ code: "", denomination: "", email: "", phone: "", type: "RETAIL", country: "DZ" });
        },
      });
    } else {
      createCustomer.mutate(form as any, {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ code: "", denomination: "", email: "", phone: "", type: "RETAIL", country: "DZ" });
        },
      });
    }
  };

  const handleEdit = (customer: Customer) => {
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

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case "RETAIL": return "default";
      case "WHOLESALE": return "secondary";
      default: return "outline";
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      RETAIL: t("customers.types.RETAIL"),
      WHOLESALE: t("customers.types.WHOLESALE"),
    };
    return labels[type] || type;
  };

  const columns: Column<Customer>[] = [
    {
      key: "code",
      label: t("customers.code"),
      sortable: true,
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
    {
      key: "denomination",
      label: t("customers.denomination"),
      sortable: true,
      render: (value: string) => <span className="text-sm font-medium">{value}</span>,
    },
    {
      key: "type",
      label: t("customers.type"),
      sortable: true,
      render: (value: string) => (
        <Badge variant={getTypeBadgeVariant(value)} size="sm">
          {getTypeLabel(value)}
        </Badge>
      ),
    },
    {
      key: "phone",
      label: t("common.phone"),
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{value || "-"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("customers.title")}
        description={`${listMeta?.total ?? 0} client${(listMeta?.total ?? 0) > 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("customers.add")}
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
                  {typeFilter ? getTypeLabel(typeFilter) : "Type"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("")}>
                  Tous les types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("RETAIL")}>
                  {t("customers.types.RETAIL")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("WHOLESALE")}>
                  {t("customers.types.WHOLESALE")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        <DataTable
          data={customerRows}
          columns={columns}
          isLoading={isLoading}
          sortable={false}
          emptyState={
            <EmptyState
              icon={Users}
              title={t("customers.empty")}
              description="Commencez par ajouter un nouveau client"
              action={{
                label: t("customers.add"),
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
                  onClick: () => deleteCustomer.mutate(row.id),
                },
              ]}
            />
          )}
        />
        {listMeta && (
          <ListPagination
            page={listMeta.page}
            totalPages={listMeta.totalPages}
            total={listMeta.total}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? t("customers.update") : t("customers.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("customers.code")}</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ex: 001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("customers.type")}</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="RETAIL">{t("customers.types.RETAIL")}</option>
                  <option value="WHOLESALE">{t("customers.types.WHOLESALE")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("customers.denomination")}</label>
              <Input
                value={form.denomination}
                onChange={(e) => setForm({ ...form, denomination: e.target.value })}
                placeholder="Perlita"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ex: ady@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common.phone")}</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+236 70064394"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={createCustomer.isPending}>
              {editingCustomer ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
