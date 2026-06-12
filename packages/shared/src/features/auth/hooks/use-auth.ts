import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { QueryKeys } from "../../../lib/query";
import {
  login,
  logout,
  getSession,
  registerTenant,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../api/client";
import { isAuthTokenValid } from "../../../lib/auth-session";
import type { LoginPayload, RegisterTenantPayload } from "../types";

const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
  NETWORK_ERROR: "Erreur de connexion. Vérifiez votre connexion internet",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const status = (error as any).status;
    if (status === 401) return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    if (status >= 500) return AUTH_ERROR_MESSAGES.SERVER_ERROR;
    return error.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { redirect } = useSearch({ strict: false }) as { redirect?: string };

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      localStorage.setItem("gestfacturation_token", data.token);
      queryClient.setQueryData(QueryKeys.session, { user: data.user });
      toast.success("Connexion réussie", {
        description: `Bienvenue, ${data.user.firstName} ${data.user.lastName}`,
      });
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("/auth")
          ? redirect
          : "/";
      navigate({ to: safeRedirect });
    },
    onError: (error: unknown) => {
      const apiError = (error as { response?: { data?: { error?: string }; status?: number } })
        ?.response?.data?.error;
      const message = apiError || getErrorMessage(error);
      toast.error("Échec de la connexion", { description: message });
    },
  });
}

export function useRegisterTenant() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterTenantPayload) => registerTenant(payload),
    onSuccess: (data) => {
      localStorage.setItem("gestfacturation_token", data.token);
      queryClient.setQueryData(QueryKeys.session, { user: data.user });
      toast.success("Compte créé avec succès", {
        description: `Bienvenue, ${data.user.firstName} ${data.user.lastName}`,
      });
      navigate({ to: "/" });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || getErrorMessage(error);
      toast.error("Échec de l'inscription", { description: message });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("gestfacturation_token");
      queryClient.setQueryData(QueryKeys.session, null);
      toast.success("Déconnexion réussie");
      navigate({ to: "/auth/login" });
    },
    onError: () => {
      localStorage.removeItem("gestfacturation_token");
      queryClient.setQueryData(QueryKeys.session, null);
      navigate({ to: "/auth/login" });
    },
  });
}

export function useSession() {
  const hasToken = typeof window !== "undefined" && isAuthTokenValid();

  return useQuery({
    queryKey: QueryKeys.session,
    queryFn: async () => {
      const result = await getSession();
      if (result.error || !result.data?.user) {
        throw result.error ?? new Error("Session invalide");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: hasToken,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onError: (error: unknown) => {
      const apiError = (
        error as { response?: { data?: { error?: string } } }
      )?.response?.data?.error;
      toast.error("Impossible d'envoyer l'email", {
        description: apiError || getErrorMessage(error),
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Mot de passe mis à jour");
    },
    onError: (error: unknown) => {
      const apiError = (
        error as { response?: { data?: { error?: string } } }
      )?.response?.data?.error;
      toast.error("Échec de la réinitialisation", {
        description: apiError || getErrorMessage(error),
      });
    },
  });
}

export function useValidateResetToken(token: string | undefined) {
  return useQuery({
    queryKey: ["auth", "reset-token", token],
    queryFn: () => validateResetToken(token!),
    enabled: Boolean(token && token.length >= 32),
    retry: false,
    staleTime: 60_000,
  });
}

export function useAuth() {
  const { data: session, isLoading, error } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isLoading,
    error,
  };
}