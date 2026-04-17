import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLogin } from "../hooks/use-auth";
export function LoginPage() {
    const login = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login.mutateAsync({ email, password });
            window.location.href = "/";
        }
        catch (err) {
            setError(err.message || "Échec de la connexion");
        }
    };
    return (_jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }, children: _jsxs("div", { style: { width: "100%", maxWidth: 400, background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }, children: [_jsx("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center" }, children: "Connexion" }), error && (_jsx("div", { style: { padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }, children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }, children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }, children: "Mot de passe" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 } })] }), _jsx("button", { type: "submit", disabled: login.isPending, style: { width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: login.isPending ? 0.7 : 1 }, children: login.isPending ? "Connexion..." : "Se connecter" })] }), _jsxs("div", { style: { marginTop: 16, textAlign: "center", fontSize: 14 }, children: ["Pas de compte? ", _jsx("a", { href: "/auth/register-tenant", style: { color: "#2563eb" }, children: "Cr\u00E9er un compte" })] })] }) }));
}
