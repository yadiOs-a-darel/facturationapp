import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useRegisterTenant } from "../hooks/use-auth";
import { ThemeSwitcher } from "../../../components/header/ThemeSwitcher";

const registerSchema = z.object({
  tenantName: z.string().min(1, "Le nom de l'entreprise est requis"),
  tenantSlug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  adminEmail: z.string().email("Email invalide"),
  adminPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterTenantPage() {
  const { mutate: register, isPending: isLoading, isSuccess } = useRegisterTenant();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantName: "",
      tenantSlug: "",
      adminEmail: "",
      adminPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  // Auto-generate slug from tenant name
  const tenantName = watch("tenantName");
  useEffect(() => {
    if (tenantName) {
      const slug = tenantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("tenantSlug", slug, { shouldValidate: false });
    }
  }, [tenantName, setValue]);

  const onSubmit = (values: RegisterFormValues) => {
    register(values);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Compte créé avec succès !</h2>
            <p className="text-muted-foreground">
              Vous allez être redirigé vers votre tableau de bord...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-lg border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-base font-bold text-primary-foreground">GF</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Créez votre espace entreprise et commencez à gérer vos factures
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Nom de l'entreprise</Label>
              <Input
                id="tenantName"
                {...registerField("tenantName")}
                aria-invalid={errors.tenantName ? "true" : "false"}
              />
              {errors.tenantName && (
                <p className="text-sm text-destructive">{errors.tenantName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Identifiant URL</Label>
              <Input
                id="tenantSlug"
                {...registerField("tenantSlug")}
                aria-invalid={errors.tenantSlug ? "true" : "false"}
              />
              <p className="text-xs text-muted-foreground">
                Utilisé pour votre URL personnalisée
              </p>
              {errors.tenantSlug && (
                <p className="text-sm text-destructive">{errors.tenantSlug.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...registerField("firstName")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...registerField("lastName")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email administrateur</Label>
              <Input
                id="adminEmail"
                type="email"
                {...registerField("adminEmail")}
                aria-invalid={errors.adminEmail ? "true" : "false"}
              />
              {errors.adminEmail && (
                <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Mot de passe</Label>
              <Input
                id="adminPassword"
                type="password"
                {...registerField("adminPassword")}
                aria-invalid={errors.adminPassword ? "true" : "false"}
              />
              {errors.adminPassword && (
                <p className="text-sm text-destructive">{errors.adminPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Création en cours..." : "Créer le compte"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Déjà un compte ?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
