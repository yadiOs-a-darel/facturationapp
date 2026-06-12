import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { validateLicenseKey } from '../../lib/license-validator';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerTenantSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  licenseKey: z.string().min(1),
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function login(req: Request, res: Response) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { email, password } = parse.data;

  const rows = await db
    .select({
      user: schema.users,
      tenant: schema.tenants,
    })
    .from(schema.users)
    .innerJoin(schema.tenants, eq(schema.users.tenantId, schema.tenants.id))
    .where(eq(schema.users.email, email))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const { user, tenant } = row;

  if (!user.isActive) {
    return res.status(403).json({ error: 'Compte désactivé. Contactez votre administrateur.' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      fontFamily: tenant.fontFamily,
    },
  });
}

export async function registerTenant(req: Request, res: Response) {
  const parse = registerTenantSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { tenantName, tenantSlug, adminEmail, adminPassword, firstName, lastName, licenseKey } = parse.data;

  // Valider la licence
  if (!licenseKey || !validateLicenseKey(licenseKey)) {
    return res.status(401).json({ error: 'Clé de licence invalide' });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Verifier si le slug ou l'email existe deja
  const existingTenant = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, tenantSlug)).limit(1);
  if (existingTenant.length > 0) {
    return res.status(409).json({ error: 'Un compte avec ce slug existe déjà' });
  }

  const existingEmail = await db.select().from(schema.users).where(eq(schema.users.email, adminEmail)).limit(1);
  if (existingEmail.length > 0) {
    return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
  }

  const tenantId = randomUUID();
  const adminUserId = randomUUID();

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(schema.tenants).values({
      id: tenantId,
      name: tenantName,
      slug: tenantSlug,
      logo: null,
      primaryColor: '#1976d2',
      secondaryColor: '#ffffff',
      fontFamily: 'Inter',
      legalName: null,
      taxNumber: null,
      address: null,
      city: null,
      country: 'DZ',
      phone: null,
      email: null,
      website: null,
      plan: 'BASIC',
      planStatus: 'TRIAL',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      licenseKey,
      licenseValidatedAt: now,
      maxUsers: 3,
      maxProducts: 500,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(schema.users).values({
      id: adminUserId,
      tenantId,
      email: adminEmail,
      passwordHash,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  const adminUser = {
    id: adminUserId,
    email: adminEmail,
    firstName,
    lastName,
    role: 'SUPER_ADMIN' as const,
  };

  const token = jwt.sign(
    {
      sub: adminUser.id,
      tenantId,
      role: adminUser.role,
    },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.status(201).json({
    token,
    tenant: {
      id: tenantId,
      name: tenantName,
      slug: tenantSlug,
    },
    user: {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
    },
  });
}

export async function getSession(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const rows = await db
    .select({
      user: schema.users,
      tenant: schema.tenants,
    })
    .from(schema.users)
    .innerJoin(schema.tenants, eq(schema.users.tenantId, schema.tenants.id))
    .where(eq(schema.users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return res.status(401).json({ error: 'Utilisateur non trouvé' });
  }

  const { user, tenant } = row;

  if (!user.isActive) {
    return res.status(403).json({ error: 'Compte désactivé. Contactez votre administrateur.' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      fontFamily: tenant.fontFamily,
    },
  });
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  return res.json({ success: true });
}
