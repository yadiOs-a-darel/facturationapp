import type { Product, ProductsListResponse, ProductUpsertPayload, ProductsListParams } from '../types';
export declare function fetchProducts(params?: ProductsListParams): Promise<ProductsListResponse>;
export declare function fetchProduct(id: string): Promise<Product>;
export declare function createProduct(payload: ProductUpsertPayload): Promise<Product>;
export declare function updateProduct(id: string, payload: ProductUpsertPayload): Promise<Product>;
export declare function deleteProduct(id: string): Promise<void>;
