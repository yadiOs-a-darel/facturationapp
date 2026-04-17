import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, } from "../hooks/use-customers";
export function CustomersPage() {
    const { data, isLoading, error } = useCustomers();
    const createCustomer = useCreateCustomer();
    const [editingId, setEditingId] = useState(null);
    const updateCustomer = useUpdateCustomer(editingId ?? "");
    const deleteCustomer = useDeleteCustomer();
    const [code, setCode] = useState("");
    const [denomination, setDenomination] = useState("");
    const [type, setType] = useState("RETAIL");
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
    const handleSubmit = (e) => {
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
        }
        else {
            createCustomer.mutate(payload, {
                onSuccess: resetForm,
            });
        }
    };
    const handleEdit = (id) => {
        if (!data)
            return;
        const c = data.data.find((x) => x.id === id);
        if (!c)
            return;
        setEditingId(id);
        setCode(c.code);
        setDenomination(c.denomination);
        setType(c.type);
        setPhone(c.phone || '');
        setCity(c.city || '');
    };
    const handleDelete = (id) => {
        if (!window.confirm('Supprimer ce client ?'))
            return;
        deleteCustomer.mutate(id);
    };
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { style: { fontSize: 22, marginBottom: 8 }, children: "Clients" }), _jsxs("form", { onSubmit: handleSubmit, style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 12,
                    alignItems: 'end',
                    background: '#ffffff',
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(15,23,42,0.06)',
                    marginBottom: 16,
                }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#4b5563' }, children: "Code" }), _jsx("input", { value: code, onChange: (e) => setCode(e.target.value), required: true, style: {
                                    marginTop: 4,
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#4b5563' }, children: "D\u00E9nomination" }), _jsx("input", { value: denomination, onChange: (e) => setDenomination(e.target.value), required: true, style: {
                                    marginTop: 4,
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#4b5563' }, children: "Type" }), _jsxs("select", { value: type, onChange: (e) => setType(e.target.value), style: {
                                    marginTop: 4,
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                }, children: [_jsx("option", { value: "RETAIL", children: "D\u00E9tail" }), _jsx("option", { value: "WHOLESALE", children: "Gros" }), _jsx("option", { value: "ORGANIZATION", children: "Organisme" }), _jsx("option", { value: "MINISTRY", children: "Minist\u00E8re" }), _jsx("option", { value: "OTHER", children: "Autre" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#4b5563' }, children: "T\u00E9l\u00E9phone" }), _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), style: {
                                    marginTop: 4,
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#4b5563' }, children: "Ville" }), _jsx("input", { value: city, onChange: (e) => setCity(e.target.value), style: {
                                    marginTop: 4,
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #d1d5db',
                                    fontSize: 14,
                                } })] }), _jsx("button", { type: "submit", disabled: createCustomer.isPending || updateCustomer.isPending, style: {
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
                        }, children: editingId ? 'Mettre à jour le client' : 'Ajouter le client' })] }), isLoading && _jsx("p", { style: { fontSize: 14 }, children: "Chargement\u2026" }), error && (_jsx("p", { style: { fontSize: 14, color: '#b91c1c' }, children: "Impossible de charger les clients." })), data && (_jsxs("table", { style: { width: '100%', fontSize: 14, marginTop: 12, borderCollapse: 'collapse' }, children: [_jsx("thead", { style: { background: '#f3f4f6' }, children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "Code" }), _jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "D\u00E9nomination" }), _jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "Type" }), _jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "T\u00E9l\u00E9phone" }), _jsx("th", { style: { textAlign: 'left', padding: '8px' }, children: "Ville" }), _jsx("th", { style: { textAlign: 'right', padding: '8px' }, children: "Actions" })] }) }), _jsx("tbody", { children: data.data.map((c) => (_jsxs("tr", { style: { borderBottom: '1px solid #e5e7eb' }, children: [_jsx("td", { style: { padding: '8px' }, children: c.code }), _jsx("td", { style: { padding: '8px' }, children: c.denomination }), _jsx("td", { style: { padding: '8px' }, children: c.type }), _jsx("td", { style: { padding: '8px' }, children: c.phone ?? '—' }), _jsx("td", { style: { padding: '8px' }, children: c.city ?? '—' }), _jsxs("td", { style: { padding: '8px', textAlign: 'right' }, children: [_jsx("button", { onClick: () => handleEdit(c.id), style: {
                                                marginRight: 8,
                                                padding: '4px 8px',
                                                borderRadius: 8,
                                                border: '1px solid #d1d5db',
                                                background: '#ffffff',
                                                fontSize: 12,
                                                cursor: 'pointer',
                                            }, children: "Modifier" }), _jsx("button", { onClick: () => handleDelete(c.id), style: {
                                                padding: '4px 8px',
                                                borderRadius: 8,
                                                border: '1px solid #fecaca',
                                                background: '#fee2e2',
                                                color: '#b91c1c',
                                                fontSize: 12,
                                                cursor: 'pointer',
                                            }, children: "Supprimer" })] })] }, c.id))) })] }))] }));
}
