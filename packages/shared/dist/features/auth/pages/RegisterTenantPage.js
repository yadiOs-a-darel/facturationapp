import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useRegisterTenant } from "../hooks/use-auth";
const registerSchema = z.object({
    tenantName: z.string().min(1, "Le nom de l'entreprise est requis"),
    tenantSlug: z
        .string()
        .min(1, "Le slug est requis")
        .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
    adminEmail: z.string().email("Email invalide"),
    adminPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
});
export function RegisterTenantPage() {
    const { mutate: register, isPending: isLoading, isSuccess } = useRegisterTenant();
    const { register: registerField, handleSubmit, formState: { errors }, watch, setValue, } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            tenantName: "",
            tenantSlug: "",
            adminEmail: "",
            adminPassword: "",
            firstName: "",
            lastName: "",
        },
    });
    // Auto-generate slug from tenant name
    const tenantName = watch("tenantName");
    useEffect(() => {
        if (tenantName) {
            const slug = tenantName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setValue("tenantSlug", slug, { shouldValidate: false });
        }
    }, [tenantName, setValue]);
    const onSubmit = (values) => {
        register(values);
    };
    if (isSuccess) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsx(Card, { className: "w-full max-w-md border-0 shadow-lg", children: _jsxs(CardContent, { className: "pt-6 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10", children: _jsx(CheckCircle2, { className: "h-6 w-6 text-success" }) }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "Compte cr\u00E9\u00E9 avec succ\u00E8s !" }), _jsx("p", { className: "text-muted-foreground", children: "Vous allez \u00EAtre redirig\u00E9 vers votre tableau de bord..." })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsxs(Card, { className: "w-full max-w-lg border-0 shadow-lg", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center gap-2 mb-4", children: _jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary", children: _jsx("span", { className: "text-base font-bold text-primary-foreground", children: "GF" }) }) }), _jsx(CardTitle, { className: "text-2xl", children: "Cr\u00E9er un compte" }), _jsx(CardDescription, { children: "Cr\u00E9ez votre espace entreprise et commencez \u00E0 g\u00E9rer vos factures" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "tenantName", children: "Nom de l'entreprise" }), _jsx(Input, { id: "tenantName", ...registerField("tenantName"), "aria-invalid": errors.tenantName ? "true" : "false" }), errors.tenantName && (_jsx("p", { className: "text-sm text-destructive", children: errors.tenantName.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "tenantSlug", children: "Identifiant URL" }), _jsx(Input, { id: "tenantSlug", ...registerField("tenantSlug"), "aria-invalid": errors.tenantSlug ? "true" : "false" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Utilis\u00E9 pour votre URL personnalis\u00E9e" }), errors.tenantSlug && (_jsx("p", { className: "text-sm text-destructive", children: errors.tenantSlug.message }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "Pr\u00E9nom" }), _jsx(Input, { id: "firstName", ...registerField("firstName"), "aria-invalid": errors.firstName ? "true" : "false" }), errors.firstName && (_jsx("p", { className: "text-sm text-destructive", children: errors.firstName.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Nom" }), _jsx(Input, { id: "lastName", ...registerField("lastName"), "aria-invalid": errors.lastName ? "true" : "false" }), errors.lastName && (_jsx("p", { className: "text-sm text-destructive", children: errors.lastName.message }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "adminEmail", children: "Email administrateur" }), _jsx(Input, { id: "adminEmail", type: "email", ...registerField("adminEmail"), "aria-invalid": errors.adminEmail ? "true" : "false" }), errors.adminEmail && (_jsx("p", { className: "text-sm text-destructive", children: errors.adminEmail.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "adminPassword", children: "Mot de passe" }), _jsx(Input, { id: "adminPassword", type: "password", ...registerField("adminPassword"), "aria-invalid": errors.adminPassword ? "true" : "false" }), errors.adminPassword && (_jsx("p", { className: "text-sm text-destructive", children: errors.adminPassword.message }))] }), _jsx(Button, { type: "submit", disabled: isLoading, className: "w-full", children: isLoading ? "Création en cours..." : "Créer le compte" })] }), _jsxs("p", { className: "mt-6 text-sm text-muted-foreground text-center", children: ["D\u00E9j\u00E0 un compte ?", " ", _jsx(Link, { to: "/auth/login", className: "font-medium text-primary hover:underline", children: "Se connecter" })] })] })] }) }));
}
