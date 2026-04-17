export type CustomerType = 'WHOLESALE' | 'RETAIL' | 'ORGANIZATION' | 'MINISTRY' | 'OTHER';
export interface Customer {
    id: string;
    code: string;
    type: CustomerType;
    denomination: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    phone2?: string | null;
    address?: string | null;
    city?: string | null;
    wilaya?: string | null;
    country: string;
    taxNumber?: string | null;
    discountRate?: number | null;
    creditLimit?: number | null;
    paymentTermDays?: number | null;
    currency?: string | null;
    isActive: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CustomersListResponse {
    data: Customer[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}
export type CustomerUpsertPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
    isActive?: boolean;
};
export interface CustomersListParams {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
}
