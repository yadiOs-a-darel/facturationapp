import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
import { Button } from "./button";
export function EmptyState({ icon, title, description, action, className, }) {
    return (_jsxs("div", { className: cn("flex flex-col items-center justify-center py-12 text-center", className), children: [icon && (_jsx("div", { className: "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted", children: _jsx("div", { className: "text-muted-foreground", children: icon }) })), _jsx("h3", { className: "text-lg font-semibold", children: title }), description && (_jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: description })), action && (_jsx(Button, { variant: action.variant, onClick: action.onClick, className: "mt-4", children: action.label }))] }));
}
