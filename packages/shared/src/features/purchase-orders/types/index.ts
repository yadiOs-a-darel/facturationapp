export interface PurchaseOrder {
  id: string;
  supplierId: string;
  number: string;
  status: string;
  orderDate: string;
  totalTTC: string | number;
}

export interface PurchaseOrderItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface PurchaseOrderPayload {
  supplierId: string;
  orderDate?: string;
  expectedDate?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrdersListParams {
  page?: number;
  limit?: number;
}

export interface PurchaseOrdersListResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
