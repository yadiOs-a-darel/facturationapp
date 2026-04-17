import type { StockMovementsResponse, StockAlertsResponse, StockMovementsParams } from '../types';
export declare function fetchStockMovements(params?: StockMovementsParams): Promise<StockMovementsResponse>;
export declare function fetchStockAlerts(): Promise<StockAlertsResponse>;
