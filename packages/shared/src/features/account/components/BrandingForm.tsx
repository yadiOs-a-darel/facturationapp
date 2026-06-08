import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { resolveUploadUrl } from '../../../lib/uploads';
import {
  BRAND_THEME_KEYS,
  BRAND_THEME_OPTIONS,
  type BrandThemeKey,
  resolveBrandThemeKey,
} from '../../../lib/brand-colors';
import {
  BRAND_FONT_KEYS,
  BRAND_FONT_OPTIONS,
  type BrandFontKey,
  resolveBrandFontKey,
} from '../../../lib/brand-fonts';
import { useMyTenant, useUpdateMyTenant, useUploadTenantLogo } from '../hooks/use-tenant';

const brandingSchema = z.object({
  theme: z.enum(BRAND_THEME_KEYS),
  fontFamily: z.enum(BRAND_FONT_KEYS),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export function BrandingForm() {
  const { data: tenant, isLoading } = useMyTenant();
  const updateTenant = useUpdateMyTenant();
  const uploadLogo = useUploadTenantLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { theme: 'turquoise', fontFamily: 'geist' },
  });

  const selectedTheme = form.watch('theme');
  const currentLogoUrl = previewUrl ?? resolveUploadUrl(tenant?.logo);

  useEffect(() => {
    if (tenant) {
      form.reset({
        theme: resolveBrandThemeKey(tenant.primaryColor),
        fontFamily: resolveBrandFontKey(tenant.fontFamily),
      });
    }
  }, [tenant, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      form.setError('root', {
        message: 'Format non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG.',
      });
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      form.setError('root', { message: 'Le fichier ne doit pas dépasser 2 Mo.' });
      return;
    }

    form.clearErrors('root');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    event.target.value = '';
  };

  const clearPendingLogo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (pendingFile) {
        await uploadLogo.mutateAsync(pendingFile);
        clearPendingLogo();
      }

      await updateTenant.mutateAsync({
        primaryColor: values.theme,
        secondaryColor: values.theme,
        fontFamily: values.fontFamily,
      });
    } catch {
      // Les toasts sont gérés dans les hooks
    }
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  const isSaving = updateTenant.isPending || uploadLogo.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>
          Choisissez la couleur de votre interface et ajoutez le logo de votre entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-3">
            <Label>Logo de l'entreprise</Label>
            <p className="text-sm text-muted-foreground">
              Formats acceptés : JPG, PNG, GIF, WebP, SVG (max. 2 Mo)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-wrap items-start gap-4">
              {currentLogoUrl ? (
                <div className="relative">
                  <img
                    src={currentLogoUrl}
                    alt="Logo de l'entreprise"
                    className="h-24 w-24 rounded-lg border object-contain bg-muted p-2"
                  />
                  {pendingFile && (
                    <button
                      type="button"
                      onClick={clearPendingLogo}
                      className="absolute -right-2 -top-2 rounded-full border bg-background p-1 text-muted-foreground shadow-sm hover:text-foreground"
                      title="Annuler la sélection"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                  <ImagePlus className="size-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {currentLogoUrl ? 'Changer le logo' : 'Choisir un fichier'}
                </Button>
                {pendingFile && (
                  <p className="text-xs text-muted-foreground">
                    Fichier sélectionné : {pendingFile.name}
                    <br />
                    Cliquez sur Enregistrer pour confirmer.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Couleur du thème</Label>
            <p className="text-sm text-muted-foreground">
              Sélectionnez une couleur pour personnaliser les boutons et l'interface
            </p>
            <Controller
              name="theme"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {BRAND_THEME_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => field.onChange(option.key as BrandThemeKey)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all hover:border-primary/50',
                        field.value === option.key
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                          : 'border-border',
                      )}
                    >
                      <div
                        className="size-10 rounded-full border shadow-sm"
                        style={{ backgroundColor: option.swatch }}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            />
            {selectedTheme && (
              <p className="text-xs text-muted-foreground">
                Thème sélectionné : {BRAND_THEME_OPTIONS.find((o) => o.key === selectedTheme)?.label}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Police de l'interface</Label>
            <p className="text-sm text-muted-foreground">
              Choisissez le style de caractères pour l'application et les factures
            </p>
            <Controller
              name="fontFamily"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BRAND_FONT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => field.onChange(option.key as BrandFontKey)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all hover:border-primary/50',
                        field.value === option.key
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                          : 'border-border',
                      )}
                    >
                      <span
                        className="text-2xl font-semibold leading-none"
                        style={{ fontFamily: option.body }}
                      >
                        {option.sample}
                      </span>
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
