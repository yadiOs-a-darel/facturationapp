import { getAuthToken, isAuthTokenValid } from './auth-session';

export function getRoleFromToken(): string | null {
  if (!isAuthTokenValid()) return null;
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

export function isAdminFromToken(): boolean {
  const role = getRoleFromToken()?.toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}
