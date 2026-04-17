import type { Customer, CustomersListResponse, CustomerUpsertPayload, CustomersListParams } from "../types";
export declare function fetchCustomers(params?: CustomersListParams): Promise<CustomersListResponse>;
export declare function fetchCustomer(id: string): Promise<Customer>;
export declare function createCustomer(payload: CustomerUpsertPayload): Promise<Customer>;
export declare function updateCustomer(id: string, payload: CustomerUpsertPayload): Promise<Customer>;
export declare function deleteCustomer(id: string): Promise<void>;
