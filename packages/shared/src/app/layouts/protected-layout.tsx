import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { Link, useRouterState } from "@tanstack/react-router";
import { rootRoute } from "./root-layout";

async function requireAuth() {
  const token = localStorage.getItem("gestfacturation_token");
  if (!token) {
    throw redirect({
      to: "/auth/login",
      search: { redirect: window.location.pathname },
    });
  }
  return true;
}

function handleLogout() {
  localStorage.removeItem("gestfacturation_token");
  window.location.href = "/auth/login";
}

function Sidebar() {
  const routerState = useRouterState({ select: (s) => s.location.pathname });
  const navItems = [
    { to: "/", label: "Tableau de bord" },
    { to: "/customers", label: "Clients" },
    { to: "/products", label: "Produits" },
    { to: "/invoices", label: "Factures" },
    { to: "/stock", label: "Stock" },
  ];

  return (
    <nav
      style={{
        width: 220,
        borderRight: "1px solid #e5e7eb",
        background: "#f9fafb",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 24, fontSize: 18, color: "#2563eb" }}>
        GestFacturation
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 14, flex: 1 }}>
        {navItems.map((item) => {
          const active = routerState === item.to;
          return (
            <li key={item.to} style={{ marginBottom: 8 }}>
              <Link
                to={item.to}
                style={{
                  display: "block",
                  padding: "8px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: active ? "#2563eb" : "#374151",
                  backgroundColor: active ? "rgba(37,99,235,0.08)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#ffffff",
          color: "#374151",
          fontSize: 13,
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        Déconnexion
      </button>
    </nav>
  );
}

export const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: async () => {
    await requireAuth();
  },
  component: function ProtectedLayout() {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24 }}>{<Outlet />}</main>
      </div>
    );
  },
});