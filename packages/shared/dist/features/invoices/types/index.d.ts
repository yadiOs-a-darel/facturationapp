export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type InvoiceType = 'INVOICE' | 'PROFORMA' | 'QUOTE' | 'CREDIT_NOTE' | 'DELIVERY_NOTE';
export interface Invoice {
    id: string;
    number: string;
    type: InvoiceType;
    customerId: string;
    issueDate: string;
    dueDate?: string | null;
    status: InvoiceStatus;
    subtotalHT: number;
    discountAmount: number;
    discountRate: number;
    taxAmount: number;
    totalTTC: number;
    paidAmount: number;
    paymentMethod?: string | null;
    paymentDate?: string | null;
    paymentRef?: string | null;
    isBackdated: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface InvoicesListResponse {
    data: Invoice[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}
export interface InvoiceItem {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountRate?: number;
    taxRate?: number;
}
export type InvoiceUpsertPayload = Partial<Invoice> & {
    customerId: string;
    items?: InvoiceItem[];
};
export interface InvoicesListParams {
    status?: string;
    customerId?: string;
    from?: string;
    to?: string;
    type?: string;
    page?: number;
    limit?: number;
}
