import type { StockMovementsParams } from "../types";
export declare function useStockMovements(params?: StockMovementsParams): import("@tanstack/react-query").UseQueryResult<import("../types").StockMovementsResponse, Error>;
export declare function useStockAlerts(): import("@tanstack/react-query").UseQueryResult<import("../types").StockAlertsResponse, Error>;
