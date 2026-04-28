import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronsUpDown, FileText, LayoutDashboard, LifeBuoy, LogOut, Package, Settings, ShoppingCart, Users, } from "lucide-react";
import { useAuth, useSignOut } from "../../features/auth/hooks/use-auth";
import { ThemeSwitcher } from "../../components/header/ThemeSwitcher";
import { LanguageSwitcher } from "../../components/header/LanguageSwitcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "../ui/sidebar";
const navigationItems = [
    { label: "Tableau de bord", path: "/", icon: LayoutDashboard, exact: true },
    { label: "Clients", path: "/customers", icon: Users },
    { label: "Produits", path: "/products", icon: Package },
    { label: "Factures", path: "/invoices", icon: FileText },
    { label: "Stock", path: "/stock", icon: ShoppingCart },
];
function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
export function AppSidebar({ collapsible = "offcanvas", } = {}) {
    const matchRoute = useMatchRoute();
    const navigate = useNavigate();
    const { user } = useAuth();
    const signOut = useSignOut();
    const isAdmin = user?.role?.toLowerCase() === "admin";
    return (_jsxs(Sidebar, { collapsible: collapsible, children: [_jsx(SidebarHeader, { className: "group-data-[collapsible=icon]:items-center", children: _jsx(SidebarMenu, { className: "group-data-[collapsible=icon]:items-center", children: _jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { size: "lg", className: "!size-10 !p-0 justify-center", children: _jsx(Link, { to: "/", className: "flex items-center justify-center", children: _jsx("div", { className: "flex size-10 items-center justify-center rounded-lg bg-primary", children: _jsx("span", { className: "text-base font-bold text-primary-foreground", children: "GF" }) }) }) }) }) }) }), _jsx(SidebarContent, { className: "group-data-[collapsible=icon]:items-center", children: _jsx(SidebarGroup, { className: "group-data-[collapsible=icon]:items-center", children: _jsx(SidebarGroupContent, { className: "flex flex-col items-center", children: _jsx(SidebarMenu, { className: "gap-3 group-data-[collapsible=icon]:items-center", children: navigationItems.map((item) => {
                                const isActive = !!matchRoute({
                                    to: item.path,
                                    fuzzy: !("exact" in item && item.exact),
                                });
                                return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { isActive: isActive, asChild: true, tooltip: item.label, className: "!size-10 !p-0 justify-center transition-all", children: _jsx(Link, { to: item.path, children: _jsx(item.icon, { className: "!size-5", strokeWidth: 1.5 }) }) }) }, item.path));
                            }) }) }) }) }), _jsx(SidebarFooter, { className: "pb-6 group-data-[collapsible=icon]:items-center", children: _jsxs(SidebarMenu, { className: "gap-3 group-data-[collapsible=icon]:items-center", children: [_jsx(SidebarMenuItem, { children: _jsxs("div", { className: "flex flex-col items-center gap-2 px-2", children: [_jsx(LanguageSwitcher, {}), _jsx(ThemeSwitcher, {})] }) }), _jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { className: "!size-10 !p-0 justify-center text-muted-foreground hover:text-foreground transition-colors", tooltip: "Notifications", children: _jsx(Bell, { className: "!size-5", strokeWidth: 1.5 }) }) }), _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { className: "w-full rounded-md p-2 hover:bg-accent transition-colors group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center", children: _jsxs("div", { className: "flex items-center gap-2 group-data-[collapsible=icon]:justify-center", children: [_jsx("div", { className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium", children: user?.firstName
                                                        ? getInitials(`${user.firstName} ${user.lastName}`)
                                                        : "?" }), _jsxs("div", { className: "flex flex-1 flex-col text-left text-sm leading-tight group-data-[collapsible=icon]:hidden", children: [_jsx("span", { className: "truncate font-medium", children: user?.firstName ? `${user.firstName} ${user.lastName}` : "Utilisateur" }), _jsx("span", { className: "text-muted-foreground truncate text-xs", children: user?.email ?? "" })] }), _jsx(ChevronsUpDown, { className: "ml-auto size-4 group-data-[collapsible=icon]:hidden" })] }) }), _jsxs(DropdownMenuContent, { align: "start", side: "top", className: "w-64 p-2", children: [_jsx(DropdownMenuLabel, { className: "px-3 py-3", children: _jsxs("div", { className: "flex flex-col gap-0.5", children: [_jsxs("span", { className: "truncate font-semibold text-base", children: [user?.firstName, " ", user?.lastName] }), _jsx("span", { className: "truncate text-xs font-normal text-muted-foreground", children: user?.email }), user?.role && (_jsx("span", { className: "truncate text-xs font-normal text-muted-foreground", children: user.role }))] }) }), _jsxs(DropdownMenuItem, { className: "gap-3 px-3 py-2 transition-colors", onClick: () => navigate({ to: "/account/settings" }), children: [_jsx(Settings, { className: "size-4" }), "Mon compte"] }), _jsxs(DropdownMenuItem, { className: "gap-3 px-3 py-2 transition-colors", children: [_jsx(LifeBuoy, { className: "size-4" }), "Obtenir de l'aide"] }), isAdmin && (_jsxs(_Fragment, { children: [_jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "gap-3 px-3 py-2 transition-colors", children: [_jsx(Settings, { className: "size-4" }), "Administration"] })] })), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "gap-3 px-3 py-2 text-destructive focus:text-destructive transition-colors", onClick: () => signOut.mutate(), children: [_jsx(LogOut, { className: "size-4" }), "Se d\u00E9connecter"] })] })] }) })] }) })] }));
}
