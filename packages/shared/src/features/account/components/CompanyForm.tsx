import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useMyTenant, useUpdateMyTenant } from '../hooks/use-tenant';

const companySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  legalName: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('Email invalide'), z.literal('')]).optional(),
  website: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyForm() {
  const { data: tenant, isLoading } = useMyTenant();
  const updateTenant = useUpdateMyTenant();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      legalName: '',
      taxNumber: '',
      address: '',
      city: '',
      country: 'DZ',
      phone: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        legalName: tenant.legalName ?? '',
        taxNumber: tenant.taxNumber ?? '',
        address: tenant.address ?? '',
        city: tenant.city ?? '',
        country: tenant.country ?? 'DZ',
        phone: tenant.phone ?? '',
        email: tenant.email ?? '',
        website: tenant.website ?? '',
      });
    }
  }, [tenant, form]);

  const onSubmit = form.handleSubmit((values) => {
    updateTenant.mutate({
      name: values.name,
      legalName: values.legalName || null,
      taxNumber: values.taxNumber || null,
      address: values.address || null,
      city: values.city || null,
      country: values.country || 'DZ',
      phone: values.phone || null,
      email: values.email || null,
      website: values.website || null,
    });
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l'entreprise</CardTitle>
        <CardDescription>
          Ces informations apparaissent sur vos factures et documents officiels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom commercial</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Raison sociale</Label>
              <Input id="legalName" {...form.register('legalName')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxNumber">NIF / N° fiscal</Label>
            <Input id="taxNumber" {...form.register('taxNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...form.register('address')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...form.register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" {...form.register('country')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input id="website" placeholder="https://..." {...form.register('website')} />
            {form.formState.errors.website && (
              <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Identifiant URL</Label>
            <Input value={tenant?.slug ?? ''} disabled />
          </div>
          <Button type="submit" disabled={updateTenant.isPending}>
            {updateTenant.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
