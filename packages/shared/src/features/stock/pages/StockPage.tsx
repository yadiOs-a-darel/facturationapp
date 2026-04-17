import { useStockAlerts } from "../hooks/use-stock";

export function StockPage() {
  const { data, isLoading, error } = useStockAlerts();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Stock</h1>
      {isLoading && <p style={{ fontSize: 14 }}>Chargement des alertes…</p>}
      {error && (
        <p style={{ fontSize: 14, color: '#b91c1c' }}>
          Impossible de charger les alertes de stock.
        </p>
      )}
      {data && (
        <div style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Produits en alerte</h2>
          {data.data.length === 0 ? (
            <p style={{ fontSize: 14 }}>Aucune alerte de stock pour le moment.</p>
          ) : (
            <table
              style={{ width: '100%', fontSize: 14, marginTop: 8, borderCollapse: 'collapse' }}
            >
              <thead style={{ background: '#fef3c7' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Nom</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Stock actuel</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Seuil mini</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((a) => (
                  <tr key={a.productId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>{a.code}</td>
                    <td style={{ padding: '8px' }}>{a.name}</td>
                    <td style={{ padding: '8px' }}>{a.stockQuantity}</td>
                    <td style={{ padding: '8px' }}>{a.stockMin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

