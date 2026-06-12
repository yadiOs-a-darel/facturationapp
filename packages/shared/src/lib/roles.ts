export function isTenantAdmin(role?: string | null): boolean {
  const normalized = role?.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}
