import { useState, FormEvent } from "react";
import { registerTenant } from "../api/client";

export function RegisterTenantPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await registerTenant({ tenantName, tenantSlug, adminEmail, adminPassword, firstName, lastName });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: 32, borderRadius: 12 }}>
          <h2 style={{ fontSize: 20, color: "#059669", marginBottom: 8 }}>Compte créé avec succès!</h2>
          <p style={{ color: "#6b7280" }}>Vous pouvez maintenant vous <a href="/auth/login" style={{ color: "#2563eb" }}>connecter</a></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 500, background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Créer un compte</h1>
        
        {error && (
          <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Nom de l'entreprise</label>
            <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Slug (URL)</label>
            <input value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required pattern="[a-z0-9-]+" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Prénom</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Nom</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Email admin</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Mot de passe</label>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" }} />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
        
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          Déjà un compte? <a href="/auth/login" style={{ color: "#2563eb" }}>Se connecter</a>
        </div>
      </div>
    </div>
  );
}