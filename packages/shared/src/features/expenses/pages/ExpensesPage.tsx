import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { EmptyState } from '../../../components/ui/empty-state';
import { PageHeader } from '../../../components/layout/page-header';
import { ListPagination } from '../../../components/ui/list-pagination';
import { usePageTitle } from '../../../hooks/use-page-title';
import { useListPagination } from '../../../hooks/use-list-pagination';
import { formatCurrency } from '../../../lib/format';
import { useCreateExpense, useDeleteExpense, useExpenses } from '../hooks/use-expenses';
import type { Expense } from '../types';

export function ExpensesPage() {
  usePageTitle('Dépenses');
  const { page, setPage, pageSize } = useListPagination();
  const { data, isLoading } = useExpenses({ page, limit: pageSize });
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Général', amount: 0, date: new Date().toISOString().slice(0, 10) });

  const columns: Column<Expense>[] = [
    { key: 'date', label: 'Date', render: (_v, r) => new Date(r.date).toLocaleDateString('fr-FR') },
    { key: 'title', label: 'Libellé', render: (_v, r) => r.title },
    { key: 'category', label: 'Catégorie', render: (_v, r) => r.category },
    { key: 'amount', label: 'Montant', render: (_v, r) => formatCurrency(Number(r.amount)) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dépenses" description="Suivez vos charges et frais" />
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Total : {formatCurrency(data?.meta.amountTotal ?? 0)}</p>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>
      <Card>
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          sortable={false}
          emptyState={<EmptyState icon={Wallet} title="Aucune dépense" description="Enregistrez vos premières dépenses" />}
          actions={(row) => <Button size="sm" variant="destructive" onClick={() => deleteExpense.mutate(row.id)}>Supprimer</Button>}
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle dépense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Libellé" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Catégorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input type="number" placeholder="Montant" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => createExpense.mutate(form, { onSuccess: () => setOpen(false) })}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
