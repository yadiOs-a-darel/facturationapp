import type { StockMovementsResponse, StockAlertsResponse, StockMovementsParams, StockAdjustmentPayload, CurrentStockResponse } from '../types';
export declare function fetchStockMovements(params?: StockMovementsParams): Promise<StockMovementsResponse>;
export declare function fetchStockAlerts(): Promise<StockAlertsResponse>;
export declare function adjustStock(payload: StockAdjustmentPayload): Promise<{
    message: string;
    newStock: number;
}>;
export declare function getCurrentStock(productId: string): Promise<CurrentStockResponse>;
