import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../lib/theme";
export function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();
    return (_jsxs(Button, { variant: "ghost", size: "icon", className: "h-9 w-9", onClick: toggleTheme, title: theme === "light" ? "Passer au mode sombre" : "Passer au mode clair", children: [theme === "light" ? (_jsx(Moon, { className: "h-[1.2rem] w-[1.2rem]" })) : (_jsx(Sun, { className: "h-[1.2rem] w-[1.2rem]" })), _jsx("span", { className: "sr-only", children: theme === "light" ? "Passer au mode sombre" : "Passer au mode clair" })] }));
}
