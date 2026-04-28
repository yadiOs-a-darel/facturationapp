import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
const languages = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
];
export function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();
    return (_jsx("div", { className: "flex items-center gap-1", children: languages.map((lang) => (_jsx(Button, { variant: language === lang.code ? "default" : "ghost", size: "icon", className: "h-7 w-7 text-xs font-medium", onClick: () => setLanguage(lang.code), title: lang.code === "fr" ? "Passer en français" : "Switch to English", children: lang.label }, lang.code))) }));
}
