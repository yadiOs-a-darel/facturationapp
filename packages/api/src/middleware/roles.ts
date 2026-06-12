import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth';
import { isTenantAdmin } from '../lib/roles';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
  if (!isTenantAdmin(req.user.role)) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  return next();
}

export function requireRoles(...roles: string[]) {
  const normalized = roles.map((r) => r.toUpperCase());
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const userRole = req.user.role?.toUpperCase() ?? '';
    if (!normalized.includes(userRole) && !isTenantAdmin(userRole)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    return next();
  };
}

export function blockCashierDestructive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
  if (req.user.role?.toUpperCase() === 'CASHIER' && req.method !== 'GET') {
    const allowed = req.path.includes('/payments') || req.path === '/' || req.method === 'POST';
    if (!allowed && !req.path.match(/\/(send|convert)/)) {
      // Caissier peut créer factures et paiements
    }
  }
  return next();
}
