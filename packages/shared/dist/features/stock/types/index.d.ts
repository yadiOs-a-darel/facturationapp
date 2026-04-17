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
export interface StockMovementsResponse {
    data: StockMovement[];
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
}
export interface StockMovementsParams {
    productId?: string;
    from?: string;
    to?: string;
}
