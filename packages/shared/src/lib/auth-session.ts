const TOKEN_KEY = 'gestfacturation_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthTokenValid(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;

    const payload = JSON.parse(atob(payloadPart)) as { sub?: string; exp?: number };
    if (!payload.sub) return false;

    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/** Retourne true si la session est utilisable ; sinon nettoie le token expiré/invalide. */
export function hasValidAuthSession(): boolean {
  if (isAuthTokenValid()) return true;
  clearAuthSession();
  return false;
}
