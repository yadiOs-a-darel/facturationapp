import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsKeys } from "../../../lib/query";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/client";
import type { ProductUpsertPayload, ProductsListParams } from "../types";

export const productKeys = {
  ...productsKeys,
  detail: (id: string) => [...productsKeys.all, 'detail', id] as const,
};

export function useProducts(params?: ProductsListParams) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Missing product id');
      return fetchProduct(id);
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductUpsertPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductUpsertPayload) => updateProduct(id, payload),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}