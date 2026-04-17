import { useQuery } from "@tanstack/react-query";
import { stockKeys } from "../../../lib/query";
import { fetchStockMovements, fetchStockAlerts } from "../api/client";
import type { StockMovementsParams } from "../types";

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