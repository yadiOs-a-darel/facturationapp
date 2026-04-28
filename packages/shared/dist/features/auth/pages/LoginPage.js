import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Sparkles } from "lucide-react";
import { useLogin } from "../hooks/use-auth";
const loginSchema = z.object({
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
    password: z.string().min(1, "Le mot de passe est requis"),
});
export function LoginPage() {
    const { mutate: login, isPending } = useLogin();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = (values) => {
        login(values);
    };
    return (_jsxs("div", { className: "min-h-screen flex", children: [_jsx("div", { className: "flex-1 flex items-center justify-center px-8 bg-background", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs(Card, { className: "border-0 shadow-none", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center gap-2 mb-4", children: _jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary", children: _jsx("span", { className: "text-base font-bold text-primary-foreground", children: "GF" }) }) }), _jsx(CardTitle, { className: "text-2xl", children: "Bienvenue" }), _jsx(CardDescription, { children: "Connectez-vous pour acc\u00E9der \u00E0 votre espace" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "vous@entreprise.com", ...register("email") }), errors.email && (_jsx("p", { className: "text-sm text-destructive", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "password", children: "Mot de passe" }), _jsx(Link, { to: "/auth/forgot-password", className: "text-sm text-muted-foreground hover:text-foreground", children: "Oubli\u00E9 ?" })] }), _jsx(Input, { id: "password", type: "password", ...register("password") }), errors.password && (_jsx("p", { className: "text-sm text-destructive", children: errors.password.message }))] }), _jsx(Button, { type: "submit", disabled: isPending, className: "w-full", children: isPending ? "Connexion..." : "Se connecter" })] }), _jsxs("p", { className: "mt-6 text-sm text-muted-foreground text-center", children: ["Nouveau ici ?", " ", _jsx(Link, { to: "/auth/register-tenant", className: "font-medium text-primary hover:underline", children: "Cr\u00E9er un compte" })] })] })] }) }) }), _jsx("div", { className: "hidden lg:flex flex-1 bg-muted items-center justify-center p-12", children: _jsxs("div", { className: "max-w-md text-center space-y-4", children: [_jsx("div", { className: "flex items-center justify-center gap-2", children: _jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-lg bg-primary", children: _jsx(Sparkles, { className: "h-6 w-6 text-primary-foreground" }) }) }), _jsx("h2", { className: "text-3xl font-semibold", children: "G\u00E9rez votre entreprise sereinement" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Factures, clients, produits et stock \u2014 tout dans un espace de travail calme et organis\u00E9." })] }) })] }));
}
