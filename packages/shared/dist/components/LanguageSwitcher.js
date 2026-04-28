import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Globe } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "./ui/dropdown-menu";
import { useI18n } from "../lib/i18n";
export function LanguageSwitcher() {
    const { language, setLanguage, t } = useI18n();
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "h-9 w-9", title: t("language.switch"), children: [_jsx(Globe, { className: "h-[1.2rem] w-[1.2rem]" }), _jsx("span", { className: "sr-only", children: t("language.switch") })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => setLanguage("fr"), className: language === "fr" ? "bg-accent" : "", children: [_jsx("span", { className: "mr-2", children: "\uD83C\uDDEB\uD83C\uDDF7" }), t("language.fr")] }), _jsxs(DropdownMenuItem, { onClick: () => setLanguage("en"), className: language === "en" ? "bg-accent" : "", children: [_jsx("span", { className: "mr-2", children: "\uD83C\uDDEC\uD83C\uDDE7" }), t("language.en")] })] })] }));
}
