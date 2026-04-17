import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        },
    });
}
export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
        },
    });
}
