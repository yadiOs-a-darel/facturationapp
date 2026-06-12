export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  taxNumber?: string | null;
  paymentTermDays?: number;
  isActive: boolean;
  notes?: string | null;
}

export type SupplierPayload = Pick<Supplier, 'code' | 'name'> &
  Partial<Omit<Supplier, 'id' | 'code' | 'name'>>;

export interface SuppliersListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface SuppliersListResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
