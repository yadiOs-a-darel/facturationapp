import { useState } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { EmptyState } from '../../../components/ui/empty-state';
import { PageHeader } from '../../../components/layout/page-header';
import { Badge } from '../../../components/ui/badge';
import { usePageTitle } from '../../../hooks/use-page-title';
import { useListPagination } from '../../../hooks/use-list-pagination';
import { ListPagination } from '../../../components/ui/list-pagination';
import { SELECT_LIST_LIMIT } from '../../../lib/pagination';
import { coerceTaxRate, formatCurrency, parseTaxRateInput } from '../../../lib/format';
import {
  invoiceItemCardClass,
  invoiceItemsSectionClass,
  invoiceSelectClass,
  invoiceSummaryClass,
} from '../../invoices/lib/invoice-ui';
import { useSuppliers } from '../../suppliers/hooks/use-suppliers';
import { useProducts } from '../../products/hooks/use-products';
import {
  useCreatePurchaseOrder,
  usePurchaseOrders,
  useReceivePurchaseOrder,
} from '../hooks/use-purchase-orders';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';

type FormItem = PurchaseOrderItem & { key: string };

function computeTotals(items: FormItem[]) {
  let subtotalHT = 0;
  let taxAmount = 0;
  for (const item of items) {
    const lineHT = item.quantity * item.unitPrice;
    const lineTax = (lineHT * (item.taxRate ?? 19)) / 100;
    subtotalHT += lineHT;
    taxAmount += lineTax;
  }
  return { subtotalHT, taxAmount, totalTTC: subtotalHT + taxAmount };
}

function emptyItem(): FormItem {
  return {
    key: crypto.randomUUID(),
    productId: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 19,
  };
}

const emptyForm = () => ({
  supplierId: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDate: '',
  notes: '',
  items: [emptyItem()] as FormItem[],
});

export function PurchaseOrdersPage() {
  usePageTitle('Achats');
  const { page, setPage, pageSize } = useListPagination();
  const { data, isLoading } = usePurchaseOrders({ page, limit: pageSize });
  const { data: suppliersData } = useSuppliers({ limit: SELECT_LIST_LIMIT });
  const { data: productsData } = useProducts({ limit: SELECT_LIST_LIMIT });
  const createPo = useCreatePurchaseOrder();
  const receive = useReceivePurchaseOrder();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const suppliers = suppliersData?.data ?? [];
  const products = (productsData?.data ?? []).filter((p) => !p.isService && p.isActive);

  const totals = computeTotals(form.items.filter((i) => i.description.trim()));

  const columns: Column<PurchaseOrder>[] = [
    { key: 'number', label: 'N°', render: (_v, r) => r.number },
    { key: 'status', label: 'Statut', render: (_v, r) => <Badge variant="outline">{r.status}</Badge> },
    {
      key: 'orderDate',
      label: 'Date',
      render: (_v, r) => new Date(r.orderDate).toLocaleDateString('fr-FR'),
    },
    { key: 'totalTTC', label: 'Total TTC', render: (_v, r) => formatCurrency(Number(r.totalTTC)) },
  ];

  const updateItem = (index: number, patch: Partial<FormItem>) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  };

  const onProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      updateItem(index, { productId, description: '', unitPrice: 0, taxRate: 19 });
      return;
    }
    updateItem(index, {
      productId,
      description: product.name,
      unitPrice: Number(product.purchasePrice) || 0,
      taxRate: coerceTaxRate(product.taxRate),
    });
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (index: number) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev;
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const handleSubmit = () => {
    if (!form.supplierId) {
      toast.error('Sélectionnez un fournisseur');
      return;
    }
    const validItems = form.items.filter((i) => i.productId && i.description.trim());
    if (validItems.length === 0) {
      toast.error('Ajoutez au moins une ligne produit');
      return;
    }
    createPo.mutate(
      {
        supplierId: form.supplierId,
        orderDate: form.orderDate,
        expectedDate: form.expectedDate || null,
        notes: form.notes.trim() || null,
        items: validItems.map(({ productId, description, quantity, unitPrice, taxRate }) => ({
          productId,
          description,
          quantity,
          unitPrice,
          taxRate,
        })),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm(emptyForm());
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bons de commande" description="Achats fournisseurs et réceptions stock" />

      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm()); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau bon de commande
        </Button>
      </div>

      <Card>
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          sortable={false}
          emptyState={
            <EmptyState
              icon={ClipboardList}
              title="Aucun bon de commande"
              description="Créez votre premier bon de commande fournisseur"
              action={{
                label: 'Nouveau bon de commande',
                onClick: () => { setForm(emptyForm()); setDialogOpen(true); },
              }}
            />
          }
          actions={(row) =>
            row.status !== 'RECEIVED' ? (
              <Button size="sm" onClick={() => receive.mutate(row.id)}>
                Réceptionner
              </Button>
            ) : (
              <Badge variant="secondary">Réceptionné</Badge>
            )
          }
        />
        {data?.meta && (
          <ListPagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Nouveau bon de commande</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Fournisseur *</label>
                <select
                  className={invoiceSelectClass}
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                >
                  <option value="">— Choisir un fournisseur —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucun fournisseur. Ajoutez-en un depuis le menu Fournisseurs.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date de commande</label>
                <input
                  type="date"
                  className={invoiceSelectClass}
                  value={form.orderDate}
                  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date de livraison prévue</label>
                <input
                  type="date"
                  className={invoiceSelectClass}
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Instructions, conditions..."
                  rows={2}
                />
              </div>
            </div>

            <div className={invoiceItemsSectionClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Lignes produits</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une ligne
                </Button>
              </div>

              {form.items.map((item, index) => (
                <div key={item.key} className={invoiceItemCardClass}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-muted-foreground">Ligne {index + 1}</span>
                    {form.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Produit *</label>
                      <select
                        className={invoiceSelectClass}
                        value={item.productId}
                        onChange={(e) => onProductSelect(index, e.target.value)}
                      >
                        <option value="">— Sélectionner —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantité</label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, { quantity: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix d&apos;achat unitaire (HT)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">TVA (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateItem(index, { taxRate: parseTaxRateInput(e.target.value) })
                        }
                      />
                    </div>

                    <div className="space-y-2 flex items-end">
                      <p className="text-sm text-muted-foreground pb-2">
                        Ligne TTC :{' '}
                        <span className="font-medium text-foreground">
                          {formatCurrency(
                            item.quantity * item.unitPrice * (1 + (item.taxRate ?? 19) / 100),
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={invoiceSummaryClass}>
              <div className="flex justify-between">
                <span>Total HT</span>
                <span>{formatCurrency(totals.subtotalHT)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t border-border/50">
                <span>Total TTC</span>
                <span>{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={createPo.isPending}>
              Créer le bon de commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
