export interface PaymentMethod {
  id: string;
  tenantId: string;
  code: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodUpsertPayload = Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>>;

export interface PaymentMethodsListParams {
  // optional filters
  isActive?: boolean;
}