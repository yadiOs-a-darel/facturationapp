import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";

const languages = [
  { code: "fr" as const, label: "FR" },
  { code: "en" as const, label: "EN" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="icon"
          className="h-7 w-7 text-xs font-medium"
          onClick={() => setLanguage(lang.code)}
          title={lang.code === "fr" ? "Passer en français" : "Switch to English"}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}