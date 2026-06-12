export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number | null;
  reason?: string | null;
  reference?: string | null;
  createdAt: string;
}

export interface StockListMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: StockListMeta;
}

export interface StockAlert {
  productId: string;
  code: string;
  name: string;
  stockQuantity: number;
  stockMin: number;
}

export interface StockAlertsResponse {
  data: StockAlert[];
  meta: StockListMeta;
}

export interface StockMovementsParams {
  productId?: string;
  from?: string;
  to?: string;
  type?: MovementType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockAlertsParams {
  page?: number;
  limit?: number;
}

export interface StockAdjustmentPayload {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
}

export interface CurrentStockResponse {
  product: {
    id: string;
    code: string;
    name: string;
    stockQuantity: number;
    stockMin: number;
    stockMax?: number | null;
    stockLocation?: string | null;
    unit: string;
  };
  recentMovements: StockMovement[];
}
