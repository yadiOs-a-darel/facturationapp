export function isTenantAdmin(role?: string): boolean {
  const normalized = role?.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}
