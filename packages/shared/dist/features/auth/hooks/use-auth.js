import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { QueryKeys } from "../../../lib/query";
import { login, logout, getSession, registerTenant } from "../api/client";
const AUTH_ERROR_MESSAGES = {
    INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
    NETWORK_ERROR: "Erreur de connexion. Vérifiez votre connexion internet",
    SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard",
    UNKNOWN_ERROR: "Une erreur inattendue s'est produite",
};
function getErrorMessage(error) {
    if (error instanceof Error) {
        const status = error.status;
        if (status === 401)
            return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
        if (status >= 500)
            return AUTH_ERROR_MESSAGES.SERVER_ERROR;
        return error.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
    }
    return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}
export function useLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (payload) => login(payload),
        onSuccess: (data) => {
            localStorage.setItem("gestfacturation_token", data.token);
            queryClient.setQueryData(QueryKeys.session, { data });
            queryClient.invalidateQueries({ queryKey: QueryKeys.session });
            toast.success("Connexion réussie", {
                description: `Bienvenue, ${data.user.firstName} ${data.user.lastName}`,
            });
            navigate({ to: "/" });
        },
        onError: (error) => {
            const message = getErrorMessage(error);
            toast.error("Échec de la connexion", { description: message });
        },
    });
}
export function useRegisterTenant() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (payload) => registerTenant(payload),
        onSuccess: (data) => {
            localStorage.setItem("gestfacturation_token", data.token);
            queryClient.setQueryData(QueryKeys.session, { data });
            queryClient.invalidateQueries({ queryKey: QueryKeys.session });
            toast.success("Compte créé avec succès", {
                description: `Bienvenue, ${data.user.firstName} ${data.user.lastName}`,
            });
            navigate({ to: "/" });
        },
        onError: (error) => {
            const message = getErrorMessage(error);
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
    return useQuery({
        queryKey: QueryKeys.session,
        queryFn: async () => {
            const result = await getSession();
            if (result.error)
                throw result.error;
            return result.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
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
