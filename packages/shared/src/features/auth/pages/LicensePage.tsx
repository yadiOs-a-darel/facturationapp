import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Key, Sparkles } from "lucide-react";
import { useValidateLicense } from "../hooks/useValidateLicense";
import { ThemeSwitcher } from "../../../components/header/ThemeSwitcher";

export function LicensePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const { mutate: validateLicense, isPending } = useValidateLicense();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    validateLicense({ licenseKey: licenseKey.trim() });
  };

  return (
    <div className="min-h-screen flex">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex-1 flex items-center justify-center px-8 bg-background">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Key className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Clé de licence requise</CardTitle>
              <CardDescription>
                Entrez votre clé de licence pour accéder à GestFacturation
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseKey">Clé de licence</Label>
                  <Input
                    id="licenseKey"
                    type="text"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format : UUID (ex: 550e8400-e29b-41d4-a716-446655440000)
                  </p>
                </div>

                <Button type="submit" disabled={isPending || !licenseKey.trim()} className="w-full">
                  {isPending ? "Validation..." : "Valider la licence"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas de clé de licence ?{" "}
                  <span className="text-foreground font-medium">
                    Contactez l'administrateur
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
        <div className="max-w-md text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold">
            Gérez votre entreprise sereinement
          </h2>
          <p className="text-muted-foreground text-lg">
            Factures, clients, produits et stock — tout dans un espace de travail
            calme et organisé.
          </p>
        </div>
      </div>
    </div>
  );
}
