import type { ProductUpsertPayload, ProductsListParams } from "../types";
export declare const productKeys: {
    detail: (id: string) => readonly ["products", "detail", string];
    all: readonly ["products"];
    list: <T>(params?: T) => readonly ["products", "list", T | undefined];
};
export declare function useProducts(params?: ProductsListParams): import("@tanstack/react-query").UseQueryResult<import("../types").ProductsListResponse, Error>;
export declare function useProduct(id: string | undefined): import("@tanstack/react-query").UseQueryResult<import("../types").Product, Error>;
export declare function useCreateProduct(): import("@tanstack/react-query").UseMutationResult<import("../types").Product, Error, ProductUpsertPayload, unknown>;
export declare function useUpdateProduct(id: string): import("@tanstack/react-query").UseMutationResult<import("../types").Product, Error, ProductUpsertPayload, unknown>;
export declare function useDeleteProduct(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
