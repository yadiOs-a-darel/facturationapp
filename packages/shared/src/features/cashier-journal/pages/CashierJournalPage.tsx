import { useState } from 'react';
import {
  Ban,
  FileText,
  Mail,
  Package,
  Receipt,
  ScrollText,
  Wallet,
} from 'lucide-react';

import { PageHeader } from '../../../components/layout/page-header';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { usePageTitle } from '../../../hooks/use-page-title';
import { formatCurrency } from '../../../lib/format';
import {
  useCashierDailyReport,
  useEmailCashierDailyReport,
} from '../hooks/use-cashier-journal';
import type { CashierActivity, CashierActivityType } from '../types';

function activityIcon(type: CashierActivityType) {
  switch (type) {
    case 'PAYMENT':
      return Receipt;
    case 'CANCELLATION':
      return Ban;
    case 'DELIVERY_NOTE':
      return Package;
    case 'EXPENSE':
      return Wallet;
    default:
      return FileText;
  }
}

function activityBadgeVariant(type: CashierActivityType) {
  if (type === 'CANCELLATION') return 'destructive' as const;
  if (type === 'PAYMENT') return 'default' as const;
  if (type === 'DRAFT') return 'secondary' as const;
  return 'outline' as const;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function ActivityTable({ activities }: { activities: CashierActivity[] }) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">Aucune opération ce jour</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Heure</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Référence</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead>Détail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((a) => {
          const Icon = activityIcon(a.type);
          return (
            <TableRow key={a.id}>
              <TableCell className="text-muted-foreground">{formatTime(a.at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={activityBadgeVariant(a.type)}>{a.label}</Badge>
                </div>
              </TableCell>
              <TableCell className="font-medium">{a.reference}</TableCell>
              <TableCell>{a.status ?? '—'}</TableCell>
              <TableCell className="text-right">
                {a.amount != null ? formatCurrency(a.amount) : '—'}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                {a.details ?? '—'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function CashierJournalPage() {
  usePageTitle('Journal caisse');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, isLoading } = useCashierDailyReport(date);
  const emailReport = useEmailCashierDailyReport();

  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal caisse"
        description="Suivi quotidien des opérations des caissiers — réservé à l'administration"
      />

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
        <Button
          variant="outline"
          onClick={() => emailReport.mutate({ date })}
          disabled={emailReport.isPending || isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          {emailReport.isPending ? 'Envoi...' : 'Envoyer par email'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement du journal...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Opérations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.totals.activityCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Paiements encaissés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(data?.totals.paymentsTotal ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Annulations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.totals.cancellationsCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dépenses caisse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(data?.totals.expensesTotal ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          {data?.cashiers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <ScrollText className="h-10 w-10 opacity-40" />
                <p>Aucun caissier actif ou aucune opération ce jour.</p>
              </CardContent>
            </Card>
          ) : (
            data?.cashiers.map((cashier) => (
              <Card key={cashier.userId}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      {cashier.firstName} {cashier.lastName}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{cashier.invoicesCount} facture(s)/devis</span>
                      <span>·</span>
                      <span>{cashier.paymentsCount} paiement(s)</span>
                      <span>·</span>
                      <span>{cashier.deliveryNotesCount} BL</span>
                      <span>·</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(cashier.paymentsTotal)} encaissé
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityTable activities={cashier.activities} />
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
