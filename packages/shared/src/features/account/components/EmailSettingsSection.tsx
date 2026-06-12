import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import {
  useEmailSettings,
  useTestEmailSettings,
  useUpdateEmailSettings,
} from '../hooks/use-email-settings';

export function EmailSettingsSection() {
  const { data: settings, isLoading } = useEmailSettings();
  const updateSettings = useUpdateEmailSettings();
  const testSettings = useTestEmailSettings();

  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
  });
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        smtpHost: settings.smtpHost ?? '',
        smtpPort: String(settings.smtpPort ?? 587),
        smtpUser: settings.smtpUser ?? '',
        smtpPass: '',
        smtpFrom: settings.smtpFrom ?? '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      smtpHost: form.smtpHost.trim(),
      smtpPort: Number(form.smtpPort) || 587,
      smtpUser: form.smtpUser.trim(),
      smtpFrom: form.smtpFrom.trim(),
      ...(form.smtpPass.trim() ? { smtpPass: form.smtpPass.trim() } : {}),
    });
  };

  const handleTest = () => {
    testSettings.mutate(testEmail.trim() || undefined);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      {settings?.configured ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Service email actif</AlertTitle>
          <AlertDescription>
            {settings.usingEnvFallback
              ? 'Configuration via variables serveur (.env). Enregistrez ci-dessous pour une config propre à votre entreprise.'
              : 'Les emails (factures, mot de passe oublié) utiliseront cette configuration.'}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Service email non configuré</AlertTitle>
          <AlertDescription>
            Renseignez les paramètres SMTP pour envoyer des factures par email et les liens de
            réinitialisation de mot de passe.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Serveur SMTP
          </CardTitle>
          <CardDescription>
            Ex. Gmail : smtp.gmail.com, port 587. Utilisez un mot de passe d&apos;application pour
            Gmail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="smtp-host">Hôte SMTP</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-from">Adresse expéditeur</Label>
              <Input
                id="smtp-from"
                type="email"
                placeholder="noreply@votre-entreprise.dz"
                value={form.smtpFrom}
                onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-user">Utilisateur SMTP</Label>
              <Input
                id="smtp-user"
                placeholder="votre@email.com"
                value={form.smtpUser}
                onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-pass">
                Mot de passe SMTP
                {settings?.hasPassword && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (laisser vide pour conserver)
                  </span>
                )}
              </Label>
              <Input
                id="smtp-pass"
                type="password"
                placeholder={settings?.hasPassword ? '••••••••' : 'Mot de passe ou app password'}
                value={form.smtpPass}
                onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={
                updateSettings.isPending ||
                !form.smtpHost ||
                !form.smtpUser ||
                !form.smtpFrom ||
                (!settings?.hasPassword && !form.smtpPass)
              }
            >
              {updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tester l&apos;envoi</CardTitle>
          <CardDescription>
            Envoyez un email de test pour vérifier la configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="test-email">Destinataire (optionnel)</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Par défaut : votre email de connexion"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testSettings.isPending || !settings?.configured}
          >
            {testSettings.isPending ? 'Envoi...' : 'Envoyer un test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
