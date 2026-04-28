import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Produit créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du produit", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
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
    mutationFn: (id: string) => deleteProduct(id),
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
