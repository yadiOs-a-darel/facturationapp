import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { stockKeys } from "../../../lib/query";
import {
  fetchStockMovements,
  fetchStockAlerts,
  adjustStock,
  getCurrentStock,
} from "../api/client";
import type { StockMovementsParams, StockAdjustmentPayload } from "../types";

export function useStockMovements(params?: StockMovementsParams) {
  return useQuery({
    queryKey: stockKeys.list(params),
    queryFn: () => fetchStockMovements(params),
  });
}

export function useStockAlerts() {
  return useQuery({
    queryKey: stockKeys.alerts,
    queryFn: () => fetchStockAlerts(),
    staleTime: 60 * 1000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockAdjustmentPayload) => adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock ajusté avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajustement du stock", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useCurrentStock(productId: string | undefined) {
  return useQuery({
    queryKey: stockKeys.detail(productId ?? ""),
    queryFn: () => {
      if (!productId) throw new Error("Missing product id");
      return getCurrentStock(productId);
    },
    enabled: !!productId,
  });
}
