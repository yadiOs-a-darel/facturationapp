import { useState, FormEvent } from "react";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../hooks/use-customers";
import type { CustomerType } from "../types";

export function CustomersPage() {
  const { data, isLoading, error } = useCustomers();
  const createCustomer = useCreateCustomer();
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateCustomer = useUpdateCustomer(editingId ?? "");
  const deleteCustomer = useDeleteCustomer();

  const [code, setCode] = useState("");
  const [denomination, setDenomination] = useState("");
  const [type, setType] = useState<CustomerType>("RETAIL");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const resetForm = () => {
    setCode("");
    setDenomination("");
    setType("RETAIL");
    setPhone('');
    setCity('');
    setEditingId(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      denomination,
      type,
      country: "Algeria",
      phone: phone || undefined,
      city: city || undefined,
    };

    if (editingId) {
      updateCustomer.mutate(payload, {
        onSuccess: resetForm,
      });
    } else {
      createCustomer.mutate(payload, {
        onSuccess: resetForm,
      });
    }
  };

  const handleEdit = (id: string) => {
    if (!data) return;
    const c = data.data.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setCode(c.code);
    setDenomination(c.denomination);
    setType(c.type);
    setPhone(c.phone || '');
    setCity(c.city || '');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    deleteCustomer.mutate(id);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Clients</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 12,
          alignItems: 'end',
          background: '#ffffff',
          padding: 16,
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(15,23,42,0.06)',
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{
              marginTop: 4,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Dénomination</label>
          <input
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
            required
            style={{
              marginTop: 4,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CustomerType)}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          >
            <option value="RETAIL">Détail</option>
            <option value="WHOLESALE">Gros</option>
            <option value="ORGANIZATION">Organisme</option>
            <option value="MINISTRY">Ministère</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Téléphone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Ville</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>
        <button
          type="submit"
          disabled={createCustomer.isPending || updateCustomer.isPending}
          style={{
            gridColumn: 'span 5',
            marginTop: 4,
            alignSelf: 'stretch',
            padding: '10px 16px',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#ffffff',
            background: editingId ? '#f59e0b' : '#2563eb',
            opacity: createCustomer.isPending || updateCustomer.isPending ? 0.7 : 1,
          }}
        >
          {editingId ? 'Mettre à jour le client' : 'Ajouter le client'}
        </button>
      </form>

      {isLoading && <p style={{ fontSize: 14 }}>Chargement…</p>}
      {error && (
        <p style={{ fontSize: 14, color: '#b91c1c' }}>
          Impossible de charger les clients.
        </p>
      )}
      {data && (
        <table style={{ width: '100%', fontSize: 14, marginTop: 12, borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Dénomination</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Téléphone</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Ville</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px' }}>{c.code}</td>
                <td style={{ padding: '8px' }}>{c.denomination}</td>
                <td style={{ padding: '8px' }}>{c.type}</td>
                <td style={{ padding: '8px' }}>{c.phone ?? '—'}</td>
                <td style={{ padding: '8px' }}>{c.city ?? '—'}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleEdit(c.id)}
                    style={{
                      marginRight: 8,
                      padding: '4px 8px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 8,
                      border: '1px solid #fecaca',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


