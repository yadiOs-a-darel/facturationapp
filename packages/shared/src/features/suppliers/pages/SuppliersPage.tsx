import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
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
import { useCreateSupplier, useDeleteSupplier, useSuppliers, useUpdateSupplier } from '../hooks/use-suppliers';
import type { Supplier } from '../types';

export function SuppliersPage() {
  usePageTitle('Fournisseurs');
  const { page, setPage, pageSize } = useListPagination();
  const { data, isLoading } = useSuppliers({ page, limit: pageSize });
  const createSupplier = useCreateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const updateSupplier = useUpdateSupplier(editing?.id ?? '');
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '' });

  const columns: Column<Supplier>[] = [
    { key: 'code', label: 'Code', render: (_v, r) => r.code },
    { key: 'name', label: 'Nom', render: (_v, r) => r.name },
    { key: 'email', label: 'Email', render: (_v, r) => r.email ?? '—' },
    { key: 'phone', label: 'Téléphone', render: (_v, r) => r.phone ?? '—' },
  ];

  const submit = () => {
    const payload = { code: form.code, name: form.name, email: form.email || null, phone: form.phone || null };
    if (editing) {
      updateSupplier.mutate(payload, { onSuccess: () => { setOpen(false); setEditing(null); } });
    } else {
      createSupplier.mutate(payload, { onSuccess: () => { setOpen(false); setForm({ code: '', name: '', email: '', phone: '' }); } });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fournisseurs" description="Gérez vos fournisseurs et partenaires" />
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setForm({ code: '', name: '', email: '', phone: '' }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>
      <Card>
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          sortable={false}
          emptyState={<EmptyState icon={Truck} title="Aucun fournisseur" description="Ajoutez votre premier fournisseur" />}
          actions={(row) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(row); setForm({ code: row.code, name: row.name, email: row.email ?? '', phone: row.phone ?? '' }); setOpen(true); }}>Modifier</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteSupplier.mutate(row.id)}>Supprimer</Button>
            </div>
          )}
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
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouveau fournisseur'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={submit}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
