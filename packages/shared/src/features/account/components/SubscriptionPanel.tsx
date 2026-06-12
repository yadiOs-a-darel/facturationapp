import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useMyTenant } from '../hooks/use-tenant';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function SubscriptionPanel() {
  const { data: tenant, isLoading } = useMyTenant();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!tenant) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abonnement</CardTitle>
        <CardDescription>Informations sur votre plan et vos limites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan actuel</p>
            <p className="text-lg font-semibold">{tenant.plan ?? '—'}</p>
          </div>
          {tenant.planStatus && (
            <Badge variant={tenant.planStatus === 'ACTIVE' ? 'success' : 'secondary'}>
              {tenant.planStatus}
            </Badge>
          )}
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fin d'essai</dt>
            <dd>{formatDate(tenant.trialEndsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fin d'abonnement</dt>
            <dd>{formatDate(tenant.subscriptionEndsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Utilisateurs max.</dt>
            <dd>{tenant.maxUsers}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Produits max.</dt>
            <dd>{tenant.maxProducts}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
