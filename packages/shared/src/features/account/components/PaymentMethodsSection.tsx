import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
} from '../../payment-methods/hooks/use-payment-methods';

export function PaymentMethodsSection() {
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', label: '' });

  const handleCreate = () => {
    createMethod.mutate(
      { code: form.code.toUpperCase(), label: form.label, isActive: true },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ code: '', label: '' });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Modes de paiement</CardTitle>
          <CardDescription>Gérez les modes de paiement acceptés par votre entreprise</CardDescription>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : methods && methods.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {methods.map((method) => (
              <li key={method.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.code}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMethod.mutate(method.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun mode de paiement configuré</p>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un mode de paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="methodCode">Code</Label>
              <Input
                id="methodCode"
                placeholder="CASH"
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="methodLabel">Libellé</Label>
              <Input
                id="methodLabel"
                placeholder="Espèces"
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!form.code || !form.label || createMethod.isPending}>
              {createMethod.isPending ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
