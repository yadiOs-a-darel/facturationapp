import { useState, FormEvent } from "react";
import { useLogin } from "../hooks/use-auth";

export function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login.mutateAsync({ email, password });
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Échec de la connexion");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Connexion</h1>
        
        {error && (
          <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
            />
          </div>
          
          <button
            type="submit"
            disabled={login.isPending}
            style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: login.isPending ? 0.7 : 1 }}
          >
            {login.isPending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          Pas de compte? <a href="/auth/register-tenant" style={{ color: "#2563eb" }}>Créer un compte</a>
        </div>
      </div>
    </div>
  );
}