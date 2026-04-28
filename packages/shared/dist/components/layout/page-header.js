import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
export function PageHeader({ title, description, subtitle, action, children, backLink, className, }) {
    return (_jsxs("div", { className: cn("flex flex-col gap-4", className), children: [backLink && (_jsxs(Link, { to: backLink.to, className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit", children: [_jsx(ChevronLeftIcon, { className: "h-4 w-4" }), backLink.label || "Retour"] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: title }), (description || subtitle) && (_jsx("p", { className: "text-sm text-muted-foreground", children: description || subtitle }))] }), (action || children) && (_jsx("div", { className: "flex items-center gap-2", children: action || children }))] }), _jsx(Separator, {})] }));
}
