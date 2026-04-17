import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';

import { db, schema } from '../../lib/db';

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
    .where(and(eq(schema.users.email, email), eq(schema.users.isActive, true)))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const { user, tenant } = row;

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

  const { tenantName, tenantSlug, adminEmail, adminPassword, firstName, lastName } = parse.data;

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const tenantId = randomUUID();
  const adminUserId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.tenants).values({
      id: tenantId,
      name: tenantName,
      slug: tenantSlug,
      plan: 'BASIC',
      planStatus: 'TRIAL',
      maxUsers: 3,
      maxProducts: 500,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
