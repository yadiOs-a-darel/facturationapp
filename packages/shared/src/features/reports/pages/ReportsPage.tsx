import { useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { reportsKeys } from '../../../lib/query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PageHeader } from '../../../components/layout/page-header';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePageTitle } from '../../../hooks/use-page-title';
import { formatCurrency } from '../../../lib/format';

async function fetchSales(from: string, to: string) {
  const { data } = await apiClient.get('/reports/sales', { params: { from, to } });
  return data;
}

async function fetchVat(from: string, to: string) {
  const { data } = await apiClient.get('/reports/vat', { params: { from, to } });
  return data;
}

async function fetchReceivables() {
  const { data } = await apiClient.get('/reports/receivables');
  return data;
}

export function ReportsPage() {
  usePageTitle('Rapports');
  const year = new Date().getFullYear();
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const sales = useQuery({ queryKey: reportsKeys.sales(from, to), queryFn: () => fetchSales(from, to) });
  const vat = useQuery({ queryKey: reportsKeys.vat(from, to), queryFn: () => fetchVat(from, to) });
  const receivables = useQuery({ queryKey: reportsKeys.receivables, queryFn: fetchReceivables });

  const exportCsv = async () => {
    const response = await apiClient.get('/reports/export/sales', {
      params: { from, to },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ventes.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Rapports" description="Ventes, TVA et créances clients" />
      <div className="flex flex-wrap gap-3 items-end">
        <div><label className="text-xs">Du</label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="text-xs">Au</label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV ventes</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Ventes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(sales.data?.meta?.totalSales ?? 0)}</p>
            <p className="text-xs text-muted-foreground">{sales.data?.meta?.count ?? 0} factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">TVA collectée</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(vat.data?.meta?.totalVAT ?? 0)}</p>
            <p className="text-xs text-muted-foreground">HT : {formatCurrency(vat.data?.meta?.totalHT ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Créances</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(receivables.data?.meta?.totalDue ?? 0)}</p>
            <p className="text-xs text-muted-foreground">{receivables.data?.meta?.count ?? 0} factures impayées</p>
          </CardContent>
        </Card>
      </div>
      {receivables.data?.data?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Factures en attente</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {receivables.data.data.slice(0, 10).map((inv: { id: string; number: string; customerName?: string; remaining: number }) => (
              <div key={inv.id} className="flex justify-between text-sm border-b py-2">
                <span>{inv.number} — {inv.customerName ?? 'Sans client'}</span>
                <span className="font-medium">{formatCurrency(inv.remaining)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
