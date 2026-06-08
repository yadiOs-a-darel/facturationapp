import { useEffect } from 'react';
import { applyBrandTheme, clearBrandTheme, resolveBrandThemeKey } from '../../../lib/brand-colors';
import { applyBrandFont, clearBrandFont, resolveBrandFontKey } from '../../../lib/brand-fonts';
import { useTheme } from '../../../lib/theme';
import { useMyTenant } from '../hooks/use-tenant';

export function TenantBrandTheme() {
  const { data: tenant } = useMyTenant();
  const { theme } = useTheme();

  useEffect(() => {
    const themeKey = resolveBrandThemeKey(tenant?.primaryColor);
    applyBrandTheme(themeKey, theme === 'dark');
    applyBrandFont(resolveBrandFontKey(tenant?.fontFamily));

    return () => {
      clearBrandTheme();
      clearBrandFont();
    };
  }, [tenant?.primaryColor, tenant?.fontFamily, theme]);

  return null;
}
