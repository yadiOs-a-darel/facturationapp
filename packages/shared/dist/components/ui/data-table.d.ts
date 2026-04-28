import * as React from "react";
export interface Column<T> {
    key: keyof T | string;
    label: string;
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    align?: "left" | "center" | "right";
}
interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}
export declare function DataTable<T extends {
    id?: string | number;
}>({ data, columns, isLoading, emptyState, onRowClick, actions, sortable, className, }: DataTableProps<T>): any;
export declare function StatusBadge({ status, labels, }: {
    status: string;
    labels?: Record<string, string>;
}): any;
export declare function RowActions({ items, }: {
    items: {
        label: string;
        icon?: React.ReactNode;
        onClick?: () => void;
        destructive?: boolean;
    }[];
}): any;
export {};
