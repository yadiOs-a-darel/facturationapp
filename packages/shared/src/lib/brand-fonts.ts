export const BRAND_FONT_KEYS = ['geist', 'mona', 'merriweather', 'system'] as const;

export type BrandFontKey = (typeof BRAND_FONT_KEYS)[number];

interface BrandFont {
  label: string;
  description: string;
  sample: string;
  body: string;
  heading: string;
}

export const BRAND_FONTS: Record<BrandFontKey, BrandFont> = {
  geist: {
    label: 'Moderne',
    description: 'Geist — lisible et contemporaine',
    sample: 'Aa Bb 123',
    body: '"Geist Variable", "Mona Sans Variable", sans-serif',
    heading: '"Geist Variable", sans-serif',
  },
  mona: {
    label: 'Épurée',
    description: 'Mona Sans — simple et nette',
    sample: 'Aa Bb 123',
    body: '"Mona Sans Variable", sans-serif',
    heading: '"Mona Sans Variable", sans-serif',
  },
  merriweather: {
    label: 'Classique',
    description: 'Merriweather — titres élégants',
    sample: 'Aa Bb 123',
    body: '"Geist Variable", sans-serif',
    heading: '"Merriweather Variable", serif',
  },
  system: {
    label: 'Système',
    description: 'Police de votre appareil',
    sample: 'Aa Bb 123',
    body: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    heading: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};

export const BRAND_FONT_OPTIONS = BRAND_FONT_KEYS.map((key) => ({
  key,
  label: BRAND_FONTS[key].label,
  description: BRAND_FONTS[key].description,
  sample: BRAND_FONTS[key].sample,
  body: BRAND_FONTS[key].body,
  heading: BRAND_FONTS[key].heading,
}));

const FONT_CSS_VARS = ['--font-body', '--font-heading'] as const;

export function isBrandFontKey(value: string | null | undefined): value is BrandFontKey {
  return !!value && BRAND_FONT_KEYS.includes(value as BrandFontKey);
}

export function resolveBrandFontKey(stored: string | null | undefined): BrandFontKey {
  if (isBrandFontKey(stored)) return stored;
  return 'geist';
}

export function getBrandFontCss(key: BrandFontKey): { body: string; heading: string } {
  const font = BRAND_FONTS[key];
  return { body: font.body, heading: font.heading };
}

export function applyBrandFont(key: BrandFontKey) {
  const { body, heading } = getBrandFontCss(key);
  const root = document.documentElement;
  root.style.setProperty('--font-body', body);
  root.style.setProperty('--font-heading', heading);
}

export function clearBrandFont() {
  const root = document.documentElement;
  for (const cssVar of FONT_CSS_VARS) {
    root.style.removeProperty(cssVar);
  }
}
