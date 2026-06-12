import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { ThemeSwitcher } from "../../../components/header/ThemeSwitcher";
import { useForgotPassword } from "../hooks/use-auth";

const forgotSchema = z.object({
  email: z.string().email("Email invalide").min(1, "L'email est requis"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { mutate: requestReset, isPending, isSuccess, data } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotFormValues) => {
    requestReset(values);
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
                  <Mail className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                Saisissez votre email pour recevoir un lien de réinitialisation
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSuccess ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {data?.message ??
                      "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez votre boîte de réception et vos spams.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à la connexion
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="vous@entreprise.com"
                        autoComplete="email"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Envoi en cours..." : "Envoyer le lien"}
                    </Button>
                  </form>

                  <p className="mt-6 text-sm text-center">
                    <Link
                      to="/auth/login"
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Retour à la connexion
                    </Link>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
