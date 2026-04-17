import { useDashboard } from "../hooks/use-reports";

export function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div style={{ padding: 24 }}>Chargement...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>Tableau de bord</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Ventes totales</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.data?.totalSales?.toLocaleString() ?? 0} DA</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total factures</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.data?.totalInvoices ?? 0}</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Factures impayées</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: "#dc2626" }}>{data?.data?.unpaidInvoices ?? 0}</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Valeur stock</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{data?.data?.stockValue?.toLocaleString() ?? 0} DA</div>
        </div>
      </div>
    </div>
  );
}