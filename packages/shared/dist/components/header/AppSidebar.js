import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Users, Package, Boxes, Settings, LogOut, Search, Sparkles, Menu, X, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLogout } from "../../features/auth/hooks/use-auth";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import { useTheme } from "../../lib/theme";
import { useState } from "react";
function getInitials(name) {
    if (!name)
        return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
const navItems = [
    { title: "nav.dashboard", url: "/", icon: LayoutDashboard },
    { title: "nav.invoices", url: "/invoices", icon: Receipt },
    { title: "nav.customers", url: "/customers", icon: Users },
    { title: "nav.products", url: "/products", icon: Package },
    { title: "nav.stock", url: "/stock", icon: Boxes },
];
export function AppSidebar() {
    const routerState = useRouterState({ select: (s) => s.location.pathname });
    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const { t } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { theme } = useTheme();
    const getUserInfo = () => {
        try {
            const token = localStorage.getItem("gestfacturation_token");
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return {
                    email: payload.email || "",
                    fullName: payload.fullName || payload.email || "",
                };
            }
        }
        catch {
            // ignore
        }
        return { email: "", fullName: "" };
    };
    const user = getUserInfo();
    const greeting = theme === "dark" ? "Bonjour" : "Hello";
    const handleLogout = () => {
        logout();
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: "lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-background border rounded-lg shadow-sm", onClick: () => setMobileMenuOpen(!mobileMenuOpen), "aria-label": mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu"), title: mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu"), children: mobileMenuOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) }), _jsx("aside", { className: "hidden lg:flex w-64 shrink-0 flex-col border-r bg-muted/30", children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "border-b bg-card", children: _jsx("div", { className: "px-4 py-4", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center shadow-lg", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsx("div", { children: _jsx("h1", { className: "text-lg font-bold tracking-tight", children: "GestFacturation" }) })] }) }) }) }), _jsx("div", { className: "px-4 py-4", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: t("common.search"), className: "pl-9 h-10 bg-background", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }) }), _jsx("nav", { className: "flex-1 px-3 space-y-1 overflow-y-auto", children: navItems.map((item) => {
                                const active = item.url === "/"
                                    ? routerState === "/"
                                    : routerState.startsWith(item.url);
                                const Icon = item.icon;
                                return (_jsxs(Link, { to: item.url, onClick: () => setMobileMenuOpen(false), className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"), children: [_jsx(Icon, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: t(item.title) })] }, item.url));
                            }) }), _jsxs("div", { className: "px-3 py-4 border-t mt-auto space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3", children: [_jsx(ThemeSwitcher, {}), _jsx(LanguageSwitcher, {})] }), _jsxs("button", { className: "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", children: [_jsx(Settings, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: t("common.save") })] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start gap-3 px-3 h-10 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground", onClick: handleLogout, disabled: isLoggingOut, children: [_jsx(LogOut, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: isLoggingOut ? t("nav.logoutLoading") : t("nav.logout") })] }), _jsx("div", { className: "pt-2 border-t mt-2", children: _jsxs("div", { className: "flex items-center gap-3 px-3 py-3", children: [_jsxs(Avatar, { className: "h-9 w-9 shrink-0", children: [_jsx(AvatarImage, { src: undefined }), _jsx(AvatarFallback, { className: "text-sm font-medium bg-primary/10 text-primary", children: getInitials(user.fullName) })] }), _jsxs("div", { className: "min-w-0 flex-1 overflow-hidden", children: [_jsx("div", { className: "text-sm font-medium truncate", children: user.fullName || "User" }), _jsx("div", { className: "text-xs text-muted-foreground truncate", children: user.email })] })] }) })] })] }) }), mobileMenuOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm", onClick: () => setMobileMenuOpen(false) }), _jsx("aside", { className: "lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r bg-background shadow-xl", children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "border-b bg-card", children: _jsx("div", { className: "px-4 py-4", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center shadow-lg", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold tracking-tight", children: "GestFacturation" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [greeting, ",", " ", _jsx("span", { className: "font-medium text-foreground", children: user.fullName || "User" })] })] })] }) }) }) }), _jsx("div", { className: "px-4 py-4", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: t("common.search"), className: "pl-9 h-10 bg-background", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }) }), _jsx("nav", { className: "flex-1 px-3 space-y-1 overflow-y-auto", children: navItems.map((item) => {
                                        const active = item.url === "/"
                                            ? routerState === "/"
                                            : routerState.startsWith(item.url);
                                        const Icon = item.icon;
                                        return (_jsxs(Link, { to: item.url, onClick: () => setMobileMenuOpen(false), className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"), children: [_jsx(Icon, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: t(item.title) })] }, item.url));
                                    }) }), _jsxs("div", { className: "px-3 py-4 border-t mt-auto space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3", children: [_jsx(ThemeSwitcher, {}), _jsx(LanguageSwitcher, {})] }), _jsxs("button", { className: "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors", children: [_jsx(Settings, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: t("common.save") })] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start gap-3 px-3 h-10 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground", onClick: handleLogout, disabled: isLoggingOut, children: [_jsx(LogOut, { className: "h-5 w-5 shrink-0" }), _jsx("span", { children: isLoggingOut ? t("nav.logoutLoading") : t("nav.logout") })] }), _jsx("div", { className: "pt-2 border-t mt-2", children: _jsxs("div", { className: "flex items-center gap-3 px-3 py-3", children: [_jsxs(Avatar, { className: "h-9 w-9 shrink-0", children: [_jsx(AvatarImage, { src: undefined }), _jsx(AvatarFallback, { className: "text-sm font-medium bg-primary/10 text-primary", children: getInitials(user.fullName) })] }), _jsxs("div", { className: "min-w-0 flex-1 overflow-hidden", children: [_jsx("div", { className: "text-sm font-medium truncate", children: user.fullName || "User" }), _jsx("div", { className: "text-xs text-muted-foreground truncate", children: user.email })] })] }) })] })] }) })] }))] }));
}
export function PageHeader({ greeting, title, subtitle, action, }) {
    return (_jsxs("div", { className: "mb-6", children: [greeting && (_jsx("div", { className: "text-sm text-muted-foreground mb-2", children: greeting })), _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-tight", children: title }), subtitle && _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })] }), action] })] }));
}
export function StatusBadge({ status }) {
    const map = {
        active: "bg-green-100 text-green-700 border-green-200",
        paid: "bg-green-100 text-green-700 border-green-200",
        SENT: "bg-blue-100 text-blue-700 border-blue-200",
        DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
        overdue: "bg-red-100 text-red-700 border-red-200",
        OVERDUE: "bg-red-100 text-red-700 border-red-200",
        CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    const labels = {
        active: "Actif",
        paid: "Payée",
        SENT: "Envoyée",
        DRAFT: "Brouillon",
        overdue: "En retard",
        OVERDUE: "En retard",
        CANCELLED: "Annulée",
    };
    return (_jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", map[status] ?? "bg-muted text-muted-foreground border-border"), children: [_jsx("span", { className: cn("h-1.5 w-1.5 rounded-full", status === "active" || status === "paid" || status === "SENT"
                    ? "bg-green-500"
                    : status === "overdue" || status === "OVERDUE"
                        ? "bg-red-500"
                        : status === "DRAFT"
                            ? "bg-amber-500"
                            : "bg-gray-500") }), labels[status] ?? status] }));
}
export function MobileTopbarBrand() {
    const { t } = useI18n();
    return (_jsxs("div", { className: "lg:hidden flex items-center gap-2 px-4 py-3 border-b bg-muted/30", children: [_jsx("div", { className: "h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center", children: _jsx(Sparkles, { className: "h-4 w-4" }) }), _jsx("span", { className: "font-semibold", children: "GestFacturation" })] }));
}
