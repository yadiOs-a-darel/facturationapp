import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middleware/auth';

const movementsQuerySchema = z.object({
  productId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function listStockMovements(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = movementsQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  const { productId, from, to } = parse.data;

  const where: any = { tenantId };
  if (productId) where.productId = productId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const data = await prisma.stockMovement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ data });
}

export async function listStockAlerts(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const products = await prisma.product.findMany({
    where: {
      tenantId,
      isActive: true,
      stockQuantity: {
        lte: prisma.product.fields.stockMin,
      },
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const data = products.map((p) => ({
    productId: p.id,
    code: p.code,
    name: p.name,
    stockQuantity: p.stockQuantity,
    stockMin: p.stockMin,
  }));

  return res.json({ data });
}

