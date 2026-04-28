import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "./dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
const badgeVariants = cva("", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground",
            success: "bg-success text-success-foreground",
            destructive: "bg-destructive text-destructive-foreground",
            warning: "bg-warning text-warning-foreground",
            info: "bg-info text-info-foreground",
            outline: "border border-border text-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function getValue(obj, key) {
    const keys = key.split(".");
    return keys.reduce((acc, k) => acc?.[k], obj);
}
export function DataTable({ data, columns, isLoading = false, emptyState, onRowClick, actions, sortable = true, className, }) {
    const [sortConfig, setSortConfig] = React.useState(null);
    const sortedData = React.useMemo(() => {
        if (!sortConfig)
            return data;
        return [...data].sort((a, b) => {
            const aValue = getValue(a, sortConfig.key);
            const bValue = getValue(b, sortConfig.key);
            if (aValue === bValue)
                return 0;
            const comparison = aValue > bValue ? 1 : -1;
            return sortConfig.direction === "asc" ? comparison : -comparison;
        });
    }, [data, sortConfig]);
    const handleSort = (key) => {
        if (!sortable)
            return;
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return prev.direction === "asc"
                    ? { key, direction: "desc" }
                    : null;
            }
            return { key, direction: "asc" };
        });
    };
    const getSortIcon = (key) => {
        if (sortConfig?.key !== key)
            return _jsx(ChevronsUpDown, { className: "ml-1 h-3 w-3 opacity-50" });
        return sortConfig.direction === "asc" ? (_jsx(ChevronUp, { className: "ml-1 h-3 w-3" })) : (_jsx(ChevronDown, { className: "ml-1 h-3 w-3" }));
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex h-48 items-center justify-center", children: _jsx("div", { className: "text-sm text-muted-foreground", children: "Chargement..." }) }));
    }
    if (data.length === 0) {
        return (emptyState || (_jsx("div", { className: "flex h-48 items-center justify-center text-sm text-muted-foreground", children: "Aucune donn\u00E9e" })));
    }
    return (_jsx("div", { className: cn("rounded-md border border-border", className), children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: "bg-muted/30", children: [columns.map((column) => (_jsx(TableHead, { className: cn(column.width && "w-[--column-width]", column.align === "right" && "text-right", column.align === "center" && "text-center"), style: column.width ? { "--column-width": column.width } : undefined, children: sortable && column.sortable !== false ? (_jsxs(Button, { variant: "ghost", size: "sm", className: "-ml-3 h-8 data-[state=open]:bg-accent", onClick: () => handleSort(column.key), children: [column.label, getSortIcon(column.key)] })) : (column.label) }, column.key))), actions && _jsx(TableHead, { className: "w-[50px]" })] }) }), _jsx(TableBody, { children: sortedData.map((row) => (_jsxs(TableRow, { className: cn(onRowClick && "cursor-pointer"), onClick: () => onRowClick?.(row), children: [columns.map((column) => {
                                const value = getValue(row, column.key);
                                const content = column.render
                                    ? column.render(value, row)
                                    : String(value ?? "-");
                                return (_jsx(TableCell, { className: cn(column.align === "right" && "text-right", column.align === "center" && "text-center"), children: content }, column.key));
                            }), actions && (_jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: actions(row) }))] }, row.id))) })] }) }));
}
export function StatusBadge({ status, labels, }) {
    const variantMap = {
        active: "success",
        inactive: "destructive",
        pending: "warning",
        completed: "success",
        failed: "destructive",
        draft: "secondary",
        sent: "info",
        paid: "success",
        overdue: "destructive",
    };
    const label = labels?.[status] || status;
    const variant = variantMap[status.toLowerCase()] || "outline";
    return (_jsx(Badge, { variant: variant, size: "sm", children: label }));
}
export function RowActions({ items, }) {
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: items.map((item, index) => (_jsxs(DropdownMenuItem, { onClick: item.onClick, className: cn(item.destructive && "text-destructive focus:text-destructive"), children: [item.icon && _jsx("span", { className: "mr-2", children: item.icon }), item.label] }, index))) })] }));
}
