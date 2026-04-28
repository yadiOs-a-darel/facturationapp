import type { ProductsListParams } from "../types";
export declare const productKeys: {
    detail: (id: string) => readonly ["products", "detail", string];
    all: readonly ["products"];
    list: <T>(params?: T) => readonly ["products", "list", T | undefined];
};
export declare function useProducts(params?: ProductsListParams): any;
export declare function useProduct(id: string | undefined): any;
export declare function useCreateProduct(): any;
export declare function useUpdateProduct(id: string): any;
export declare function useDeleteProduct(): any;
