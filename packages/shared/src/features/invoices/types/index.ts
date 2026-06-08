export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type InvoiceType = 'INVOICE' | 'PROFORMA' | 'QUOTE' | 'CREDIT_NOTE' | 'DELIVERY_NOTE';

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  customerId?: string | null;
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
  notes?: string | null;
  terms?: string | null;
  items?: InvoiceItem[];
  payments?: Array<Record<string, unknown>>;
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
  totalTTC?: number;
}

export type InvoiceUpsertPayload = Partial<Invoice> & {
  customerId?: string;
  items?: InvoiceItem[];
  markAsPaid?: boolean;
  initialPaymentAmount?: number;
  paymentRef?: string | null;
  isBackdated?: boolean;
};

export interface InvoiceDetail extends Invoice {
  customer?: {
    id: string;
    denomination: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
  };
  tenant?: {
    name: string;
    legalName?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    logo?: string | null;
    fontFamily?: string | null;
  };
}

export interface RecordPaymentPayload {
  amount: number;
  methodCode: string;
  reference?: string | null;
  date?: string;
  notes?: string | null;
}

export interface InvoicesListParams {
  status?: string;
  customerId?: string;
  from?: string;
  to?: string;
  type?: string;
  page?: number;
  limit?: number;
}