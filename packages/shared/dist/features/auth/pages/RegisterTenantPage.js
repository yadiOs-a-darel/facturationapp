import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await registerTenant({ tenantName, tenantSlug, adminEmail, adminPassword, firstName, lastName });
            setSuccess(true);
        }
        catch (err) {
            setError(err.message || "Échec de l'inscription");
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }, children: _jsxs("div", { style: { textAlign: "center", background: "#fff", padding: 32, borderRadius: 12 }, children: [_jsx("h2", { style: { fontSize: 20, color: "#059669", marginBottom: 8 }, children: "Compte cr\u00E9\u00E9 avec succ\u00E8s!" }), _jsxs("p", { style: { color: "#6b7280" }, children: ["Vous pouvez maintenant vous ", _jsx("a", { href: "/auth/login", style: { color: "#2563eb" }, children: "connecter" })] })] }) }));
    }
    return (_jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: 24 }, children: _jsxs("div", { style: { width: "100%", maxWidth: 500, background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }, children: [_jsx("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 24 }, children: "Cr\u00E9er un compte" }), error && (_jsx("div", { style: { padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }, children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Nom de l'entreprise" }), _jsx("input", { value: tenantName, onChange: (e) => setTenantName(e.target.value), required: true, style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Slug (URL)" }), _jsx("input", { value: tenantSlug, onChange: (e) => setTenantSlug(e.target.value), required: true, pattern: "[a-z0-9-]+", style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Pr\u00E9nom" }), _jsx("input", { value: firstName, onChange: (e) => setFirstName(e.target.value), required: true, style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Nom" }), _jsx("input", { value: lastName, onChange: (e) => setLastName(e.target.value), required: true, style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Email admin" }), _jsx("input", { type: "email", value: adminEmail, onChange: (e) => setAdminEmail(e.target.value), required: true, style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14 }, children: "Mot de passe" }), _jsx("input", { type: "password", value: adminPassword, onChange: (e) => setAdminPassword(e.target.value), required: true, minLength: 6, style: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #d1d5db" } })] }), _jsx("button", { type: "submit", disabled: loading, style: { width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }, children: loading ? "Création..." : "Créer le compte" })] }), _jsxs("div", { style: { marginTop: 16, textAlign: "center", fontSize: 14 }, children: ["D\u00E9j\u00E0 un compte? ", _jsx("a", { href: "/auth/login", style: { color: "#2563eb" }, children: "Se connecter" })] })] }) }));
}
