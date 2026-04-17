import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionKeys } from "../../../lib/query";
import { login, logout, getSession } from "../api/client";
export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => login(payload),
        onSuccess: (data) => {
            localStorage.setItem('gestfacturation_token', data.token);
            queryClient.invalidateQueries({ queryKey: sessionKeys.all });
        },
    });
}
export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            localStorage.removeItem('gestfacturation_token');
            queryClient.invalidateQueries({ queryKey: sessionKeys.all });
        },
    });
}
export function useSession() {
    return useQuery({
        queryKey: sessionKeys.all,
        queryFn: getSession,
        staleTime: 5 * 60 * 1000,
    });
}
