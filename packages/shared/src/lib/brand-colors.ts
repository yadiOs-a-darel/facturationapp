export const BRAND_THEME_KEYS = [
  'turquoise',
  'bleu',
  'vert',
  'jaune',
  'orange',
  'rouge',
  'violet',
  'rose',
] as const;

export type BrandThemeKey = (typeof BRAND_THEME_KEYS)[number];

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
}

interface BrandTheme {
  label: string;
  swatch: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const BRAND_THEMES: Record<BrandThemeKey, BrandTheme> = {
  turquoise: {
    label: 'Turquoise',
    swatch: '#0d9488',
    light: {
      primary: 'oklch(0.45 0.1 197)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.62 0.12 38)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.72 0.12 197)',
      primaryForeground: 'oklch(0.18 0.01 197)',
      secondary: 'oklch(0.32 0.015 197)',
      secondaryForeground: 'oklch(0.92 0.01 197)',
    },
  },
  bleu: {
    label: 'Bleu',
    swatch: '#2563eb',
    light: {
      primary: 'oklch(0.45 0.18 260)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.55 0.12 260)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.65 0.18 260)',
      primaryForeground: 'oklch(0.15 0.02 260)',
      secondary: 'oklch(0.35 0.08 260)',
      secondaryForeground: 'oklch(0.92 0.01 260)',
    },
  },
  vert: {
    label: 'Vert',
    swatch: '#16a34a',
    light: {
      primary: 'oklch(0.45 0.15 145)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.55 0.12 145)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.65 0.17 145)',
      primaryForeground: 'oklch(0.15 0.02 145)',
      secondary: 'oklch(0.35 0.08 145)',
      secondaryForeground: 'oklch(0.92 0.01 145)',
    },
  },
  jaune: {
    label: 'Jaune',
    swatch: '#ca8a04',
    light: {
      primary: 'oklch(0.55 0.14 85)',
      primaryForeground: 'oklch(0.2 0.02 85)',
      secondary: 'oklch(0.72 0.12 85)',
      secondaryForeground: 'oklch(0.2 0.02 85)',
    },
    dark: {
      primary: 'oklch(0.78 0.14 85)',
      primaryForeground: 'oklch(0.2 0.02 85)',
      secondary: 'oklch(0.4 0.08 85)',
      secondaryForeground: 'oklch(0.95 0.01 85)',
    },
  },
  orange: {
    label: 'Orange',
    swatch: '#ea580c',
    light: {
      primary: 'oklch(0.55 0.18 55)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.68 0.14 55)',
      secondaryForeground: 'oklch(0.2 0.02 55)',
    },
    dark: {
      primary: 'oklch(0.72 0.17 55)',
      primaryForeground: 'oklch(0.18 0.02 55)',
      secondary: 'oklch(0.38 0.1 55)',
      secondaryForeground: 'oklch(0.95 0.01 55)',
    },
  },
  rouge: {
    label: 'Rouge',
    swatch: '#dc2626',
    light: {
      primary: 'oklch(0.5 0.2 25)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.6 0.16 25)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.62 0.2 25)',
      primaryForeground: 'oklch(0.15 0.02 25)',
      secondary: 'oklch(0.35 0.1 25)',
      secondaryForeground: 'oklch(0.95 0.01 25)',
    },
  },
  violet: {
    label: 'Violet',
    swatch: '#7c3aed',
    light: {
      primary: 'oklch(0.48 0.2 300)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.58 0.15 300)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.65 0.2 300)',
      primaryForeground: 'oklch(0.15 0.02 300)',
      secondary: 'oklch(0.35 0.1 300)',
      secondaryForeground: 'oklch(0.95 0.01 300)',
    },
  },
  rose: {
    label: 'Rose',
    swatch: '#db2777',
    light: {
      primary: 'oklch(0.52 0.2 350)',
      primaryForeground: 'oklch(0.98 0 0)',
      secondary: 'oklch(0.62 0.15 350)',
      secondaryForeground: 'oklch(0.98 0 0)',
    },
    dark: {
      primary: 'oklch(0.68 0.2 350)',
      primaryForeground: 'oklch(0.15 0.02 350)',
      secondary: 'oklch(0.36 0.1 350)',
      secondaryForeground: 'oklch(0.95 0.01 350)',
    },
  },
};

export const BRAND_THEME_OPTIONS = BRAND_THEME_KEYS.map((key) => ({
  key,
  label: BRAND_THEMES[key].label,
  swatch: BRAND_THEMES[key].swatch,
}));

const BRAND_CSS_VARS = [
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
] as const;

export function isBrandThemeKey(value: string | null | undefined): value is BrandThemeKey {
  return !!value && BRAND_THEME_KEYS.includes(value as BrandThemeKey);
}

export function resolveBrandThemeKey(stored: string | null | undefined): BrandThemeKey {
  if (isBrandThemeKey(stored)) return stored;
  return 'turquoise';
}

export function applyBrandTheme(key: BrandThemeKey, isDark: boolean) {
  const preset = BRAND_THEMES[key];
  const colors = isDark ? preset.dark : preset.light;
  const root = document.documentElement;

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
}

export function clearBrandTheme() {
  const root = document.documentElement;
  for (const cssVar of BRAND_CSS_VARS) {
    root.style.removeProperty(cssVar);
  }
}
