import type { Invoice, InvoicesListResponse, InvoiceUpsertPayload, InvoicesListParams } from '../types';
export declare function fetchInvoices(params?: InvoicesListParams): Promise<InvoicesListResponse>;
export declare function fetchInvoice(id: string): Promise<Invoice>;
export declare function createInvoice(payload: InvoiceUpsertPayload): Promise<Invoice>;
export declare function updateInvoice(id: string, payload: InvoiceUpsertPayload): Promise<Invoice>;
export declare function deleteInvoice(id: string): Promise<void>;
