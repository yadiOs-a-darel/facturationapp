import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthUserPayload {
  sub: string;
  tenantId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
