export interface Product {
    id: string;
    code: string;
    barcode?: string | null;
    name: string;
    description?: string | null;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    taxRate: number;
    discountRate: number;
    stockQuantity: number;
    stockMin: number;
    stockMax?: number | null;
    stockLocation?: string | null;
    image?: string | null;
    isActive: boolean;
    isService: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ProductsListResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}
export type ProductUpsertPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'barcode' | 'stockMax' | 'stockLocation' | 'image' | 'discountRate'> & Partial<Pick<Product, 'barcode' | 'stockMax' | 'stockLocation' | 'image' | 'discountRate'>>;
export interface ProductsListParams {
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
}
