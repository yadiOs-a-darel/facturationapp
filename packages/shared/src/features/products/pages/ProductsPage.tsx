import { useProducts } from "../hooks/use-products";

export function ProductsPage() {
  const { data, isLoading, error } = useProducts();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Produits</h1>
      {isLoading && <p style={{ fontSize: 14 }}>Chargement…</p>}
      {error && (
        <p style={{ fontSize: 14, color: '#b91c1c' }}>
          Impossible de charger les produits.
        </p>
      )}
      {data && (
        <table style={{ width: '100%', fontSize: 14, marginTop: 12, borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Nom</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Prix vente</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px' }}>{p.code}</td>
                <td style={{ padding: '8px' }}>{p.name}</td>
                <td style={{ padding: '8px' }}>{p.sellingPrice.toFixed(2)}</td>
                <td style={{ padding: '8px' }}>{p.stockQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

