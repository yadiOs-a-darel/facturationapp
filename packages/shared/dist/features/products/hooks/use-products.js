import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsKeys } from "../../../lib/query";
import { fetchProducts, fetchProduct, createProduct, updateProduct, deleteProduct, } from "../api/client";
export const productKeys = {
    ...productsKeys,
    detail: (id) => [...productsKeys.all, 'detail', id],
};
export function useProducts(params) {
    return useQuery({
        queryKey: productsKeys.list(params),
        queryFn: () => fetchProducts(params),
    });
}
export function useProduct(id) {
    return useQuery({
        queryKey: productKeys.detail(id ?? ''),
        queryFn: () => {
            if (!id)
                throw new Error('Missing product id');
            return fetchProduct(id);
        },
        enabled: !!id,
    });
}
export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => createProduct(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
            toast.success("Produit créé avec succès");
        },
        onError: (error) => {
            toast.error("Erreur lors de la création du produit", {
                description: error instanceof Error ? error.message : "Une erreur est survenue",
            });
        },
    });
}
export function useUpdateProduct(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateProduct(id, payload),
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
            queryClient.setQueryData(productKeys.detail(id), updatedProduct);
            toast.success("Produit mis à jour avec succès");
        },
        onError: (error) => {
            toast.error("Erreur lors de la mise à jour du produit", {
                description: error instanceof Error ? error.message : "Une erreur est survenue",
            });
        },
    });
}
export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
            toast.success("Produit supprimé avec succès");
        },
        onError: (error) => {
            toast.error("Erreur lors de la suppression du produit", {
                description: error instanceof Error ? error.message : "Une erreur est survenue",
            });
        },
    });
}
