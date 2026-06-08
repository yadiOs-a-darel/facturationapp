import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db, schema } from '../../lib/db';
import { isTenantAdmin } from '../../lib/roles';

type AuthRequest = Request & { user?: { userId: string; tenantId: string; role: string } };

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().optional(),
  phone: z.string().nullable().optional(),
  email: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
  website: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  logo: z
    .union([
      z.string().url(),
      z.string().regex(/^\/uploads\//),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  primaryColor: z
    .enum(['turquoise', 'bleu', 'vert', 'jaune', 'orange', 'rouge', 'violet', 'rose'])
    .nullable()
    .optional(),
  secondaryColor: z
    .enum(['turquoise', 'bleu', 'vert', 'jaune', 'orange', 'rouge', 'violet', 'rose'])
    .nullable()
    .optional(),
  fontFamily: z
    .enum(['geist', 'mona', 'merriweather', 'system'])
    .nullable()
    .optional(),
});

function serializeTenant(tenant: typeof schema.tenants.$inferSelect) {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    fontFamily: tenant.fontFamily,
    legalName: tenant.legalName,
    taxNumber: tenant.taxNumber,
    address: tenant.address,
    city: tenant.city,
    country: tenant.country,
    phone: tenant.phone,
    email: tenant.email,
    website: tenant.website,
    plan: tenant.plan,
    planStatus: tenant.planStatus,
    trialEndsAt: tenant.trialEndsAt,
    subscriptionEndsAt: tenant.subscriptionEndsAt,
    maxUsers: tenant.maxUsers,
    maxProducts: tenant.maxProducts,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

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
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  return res.json(serializeTenant(tenant));
}

export async function updateMyTenant(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const parse = updateTenantSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const data = {
    ...parse.data,
    email: parse.data.email === '' ? null : parse.data.email,
    website: parse.data.website === '' ? null : parse.data.website,
    logo: parse.data.logo === '' ? null : parse.data.logo,
    updatedAt: new Date(),
  };

  await db
    .update(schema.tenants)
    .set(data)
    .where(eq(schema.tenants.id, tenantId));

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  return res.json(serializeTenant(tenant));
}

export async function uploadTenantLogo(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  const logoUrl = `/uploads/logos/${file.filename}`;

  await db
    .update(schema.tenants)
    .set({ logo: logoUrl, updatedAt: new Date() })
    .where(eq(schema.tenants.id, tenantId));

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  return res.json(serializeTenant(tenant));
}

export async function uploadTenantLogo(req: AuthRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  const logoUrl = `/uploads/logos/${file.filename}`;

  await db
    .update(schema.tenants)
    .set({ logo: logoUrl, updatedAt: new Date() })
    .where(eq(schema.tenants.id, tenantId));

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  return res.json(serializeTenant(tenant));
}
