import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db, schema } from '../../lib/db';

type AuthRequest = Request & { user?: { userId: string; tenantId: string; role: string } };

const updateBrandingSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

export async function getMyTenant(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const rows = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  const tenant = rows[0];

  if (!tenant) {
    return res.status(404).json({ error: 'Magasin introuvable' });
  }

  return res.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    fontFamily: tenant.fontFamily,
    plan: tenant.plan,
    planStatus: tenant.planStatus,
  });
}

export async function updateMyTenantBranding(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const parse = updateBrandingSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const data = parse.data;

  await db
    .update(schema.tenants)
    .set(data)
    .where(eq(schema.tenants.id, tenantId));

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  return res.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    fontFamily: tenant.fontFamily,
    plan: tenant.plan,
    planStatus: tenant.planStatus,
  });
}
