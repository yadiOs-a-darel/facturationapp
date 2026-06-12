import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuth, useSignOut } from "../../features/auth/hooks/use-auth";
import { useMyTenant } from "../../features/account/hooks/use-tenant";
import { isTenantAdmin } from "../../lib/roles";
import { CompanyLogo } from "./company-logo";
import { ThemeSwitcher } from "../../components/header/ThemeSwitcher";
import { LanguageSwitcher } from "../../components/header/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

const navigationItems = [
  { label: "Tableau de bord", path: "/", icon: LayoutDashboard, exact: true },
  { label: "Clients", path: "/customers", icon: Users },
  { label: "Produits", path: "/products", icon: Package },
  { label: "Factures", path: "/invoices", icon: FileText },
  { label: "Stock", path: "/stock", icon: ShoppingCart },
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar({
  collapsible = "offcanvas",
}: {
  collapsible?: "offcanvas" | "icon" | "none";
} = {}) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tenant } = useMyTenant();
  const signOut = useSignOut();

  const isAdmin = isTenantAdmin(user?.role);
  const companyName = tenant?.name ?? "GestFacturation";

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" className="flex items-center gap-3">
                <CompanyLogo logo={tenant?.logo} companyName={companyName} />
                <span className="text-lg font-bold truncate">{companyName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="group-data-[collapsible=icon]:items-center">
          <SidebarGroupContent className="flex flex-col items-center">
            <SidebarMenu className="gap-3 group-data-[collapsible=icon]:items-center">
              {navigationItems.map((item) => {
                const isActive = !!matchRoute({
                  to: item.path,
                  fuzzy: !("exact" in item && item.exact),
                });

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      asChild
                      tooltip={item.label}
                      className="transition-all"
                    >
                      <Link to={item.path}>
                        <item.icon className="!size-5" strokeWidth={1.5} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
      <div className="flex items-center gap-1 px-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <SidebarMenuButton
                className="!size-8 !p-0 justify-center text-muted-foreground hover:text-foreground transition-colors"
                tooltip="Notifications"
              >
                <Bell className="!size-4" strokeWidth={1.5} />
              </SidebarMenuButton>
              <ThemeSwitcher />
            </div>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between px-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full rounded-md p-2 hover:bg-accent transition-colors group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {user?.firstName
                      ? getInitials(`${user.firstName} ${user.lastName}`)
                      : "?"}
                  </div>
                  <div className="flex flex-1 flex-col text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-64 p-2">
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate font-semibold text-base">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                    {user?.role && (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {user.role}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="gap-3 px-3 py-2 transition-colors"
                  onClick={() => navigate({ to: "/account/settings" })}
                >
                  <Settings className="size-4" />
                  Mon compte
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-3 px-3 py-2 transition-colors">
                      <Settings className="size-4" />
                      Administration
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-3 px-3 py-2 text-destructive focus:text-destructive transition-colors"
                  onClick={() => signOut.mutate()}
                >
                  <LogOut className="size-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
