import { useInvoices } from "../hooks/use-invoices";

export function InvoicesPage() {
  const { data, isLoading, error } = useInvoices();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Factures</h1>
      {isLoading && <p style={{ fontSize: 14 }}>Chargement…</p>}
      {error && (
        <p style={{ fontSize: 14, color: "#b91c1c" }}>
          Impossible de charger les factures.
        </p>
      )}
      {data && (
        <table style={{ width: "100%", fontSize: 14, marginTop: 12, borderCollapse: "collapse" }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>Numéro</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Statut</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px" }}>{inv.number}</td>
                <td style={{ padding: "8px" }}>{inv.type}</td>
                <td style={{ padding: "8px" }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                <td style={{ padding: "8px" }}>{inv.status}</td>
                <td style={{ padding: "8px" }}>{inv.totalTTC.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

