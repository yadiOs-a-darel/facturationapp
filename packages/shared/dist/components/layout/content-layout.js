import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
const sizeStyles = {
    default: "max-w-5xl px-6",
    compact: "max-w-4xl px-12",
};
export function ContentLayout({ title, description, actions, children, size = "default", variant = "standalone", }) {
    const header = (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100", children: title }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }), description && _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-2", children: description })] }));
    if (variant === "nested") {
        return (_jsxs(_Fragment, { children: [header, children] }));
    }
    return (_jsx("div", { className: "flex-1 overflow-y-auto bg-white dark:bg-gray-900", children: _jsxs("div", { className: cn("mx-auto pt-4 pb-12", sizeStyles[size]), children: [header, children] }) }));
}
