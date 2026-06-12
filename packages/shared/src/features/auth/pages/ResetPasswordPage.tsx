import { Link, useSearch } from "@tanstack/react-router";
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
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { ThemeSwitcher } from "../../../components/header/ThemeSwitcher";
import { useResetPassword, useValidateResetToken } from "../hooks/use-auth";

const resetSchema = z
  .object({
    password: z.string().min(6, "Au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { token } = useSearch({ strict: false }) as { token?: string };
  const { data: validation, isLoading: validating } = useValidateResetToken(token);
  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (values: ResetFormValues) => {
    if (!token) return;
    resetPassword({ token, password: values.password });
  };

  const tokenInvalid = !token || (validation && !validation.valid);

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
                  <KeyRound className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Choisissez un mot de passe sécurisé pour votre compte
              </CardDescription>
            </CardHeader>

            <CardContent>
              {validating ? (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Vérification du lien...</p>
                </div>
              ) : isSuccess ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Votre mot de passe a été mis à jour. Vous pouvez vous connecter.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/auth/login">Se connecter</Link>
                  </Button>
                </div>
              ) : tokenInvalid ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-destructive">
                    Ce lien est invalide ou a expiré. Demandez un nouveau lien de
                    réinitialisation.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth/forgot-password">Demander un nouveau lien</Link>
                  </Button>
                  <p className="text-sm">
                    <Link
                      to="/auth/login"
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Retour à la connexion
                    </Link>
                  </p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Enregistrement..." : "Enregistrer le mot de passe"}
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
