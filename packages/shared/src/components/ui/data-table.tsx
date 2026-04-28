import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge, type BadgeProps } from "./badge";

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

function getValue<T>(obj: T, key: string): any {
  const keys = key.split(".");
  return keys.reduce((acc, k) => (acc as any)?.[k], obj);
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyState,
  onRowClick,
  actions,
  sortable = true,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc"
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      emptyState || (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Aucune donnée
        </div>
      )
    );
  }

  return (
    <div className={cn("rounded-md border border-border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {columns.map((column) => (
              <TableHead
                key={column.key as string}
                className={cn(
                  column.width && "w-[--column-width]",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center"
                )}
                style={column.width ? { "--column-width": column.width } as any : undefined}
              >
                {sortable && column.sortable !== false ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => handleSort(column.key as string)}
                  >
                    {column.label}
                    {getSortIcon(column.key as string)}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
            {actions && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow
              key={row.id as string}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = getValue(row, column.key as string);
                const content = column.render
                  ? column.render(value, row)
                  : String(value ?? "-");

                return (
                  <TableCell
                    key={column.key as string}
                    className={cn(
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center"
                    )}
                  >
                    {content}
                  </TableCell>
                );
              })}
              {actions && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels?: Record<string, string>;
}) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
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

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

export function RowActions({
  items,
}: {
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    destructive?: boolean;
  }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={cn(item.destructive && "text-destructive focus:text-destructive")}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
