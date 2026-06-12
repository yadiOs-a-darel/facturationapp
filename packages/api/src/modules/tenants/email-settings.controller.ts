import type { Response } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  buildTestEmailHtml,
  isEmailConfigured,
  resolveSmtpConfig,
  sendEmail,
  verifySmtpConfig,
} from '../../lib/email';
import { isTenantAdmin } from '../../lib/roles';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const updateEmailSettingsSchema = z.object({
  smtpHost: z.string().min(1).max(255),
  smtpPort: z.coerce.number().int().min(1).max(65535).default(587),
  smtpUser: z.string().min(1).max(255),
  smtpPass: z.string().min(1).max(512).optional(),
  smtpFrom: z.string().email().max(255),
});

const testEmailSchema = z.object({
  to: z.string().email().optional(),
});

async function getTenantOr404(tenantId: string) {
  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);
  return tenant ?? null;
}

export async function getEmailSettings(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const tenant = await getTenantOr404(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Entreprise introuvable' });

  const resolved = resolveSmtpConfig(tenant);
  const tenantConfigured = Boolean(tenant.smtpHost && tenant.smtpUser && tenant.smtpPass);

  return res.json({
    configured: isEmailConfigured(tenant),
    source: resolved?.source ?? 'none',
    smtpHost: tenant.smtpHost ?? (resolved?.source === 'env' ? resolved.host : null),
    smtpPort: tenant.smtpPort ?? (resolved?.source === 'env' ? resolved.port : 587),
    smtpUser: tenant.smtpUser ?? (resolved?.source === 'env' ? resolved.user : null),
    smtpFrom: tenant.smtpFrom ?? (resolved?.source === 'env' ? resolved.from : null),
    hasPassword: tenantConfigured ? Boolean(tenant.smtpPass) : Boolean(process.env.SMTP_PASS),
    usingEnvFallback: !tenantConfigured && resolved?.source === 'env',
  });
}

export async function updateEmailSettings(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const parse = updateEmailSettingsSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const tenant = await getTenantOr404(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Entreprise introuvable' });

  const { smtpHost, smtpPort, smtpUser, smtpFrom } = parse.data;
  let smtpPass = parse.data.smtpPass;

  if (!smtpPass) {
    if (tenant.smtpPass) {
      smtpPass = tenant.smtpPass;
    } else {
      return res.status(400).json({
        error: 'Le mot de passe SMTP est requis pour la première configuration.',
      });
    }
  }

  const now = new Date();

  await db
    .update(schema.tenants)
    .set({
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
      updatedAt: now,
    })
    .where(eq(schema.tenants.id, tenantId));

  return res.json({
    success: true,
    message: 'Configuration email enregistrée.',
  });
}

export async function testEmailSettings(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  if (!isTenantAdmin(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const parse = testEmailSchema.safeParse(req.body ?? {});
  if (!parse.success) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const tenant = await getTenantOr404(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Entreprise introuvable' });

  const config = resolveSmtpConfig(tenant);
  if (!config) {
    return res.status(400).json({
      error: 'Configuration SMTP incomplète. Enregistrez d\'abord les paramètres.',
    });
  }

  let to = parse.data.to;
  if (!to) {
    const [user] = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    to = user?.email;
  }

  if (!to) {
    return res.status(400).json({ error: 'Aucune adresse de test disponible.' });
  }

  try {
    await verifySmtpConfig(config);
    await sendEmail({
      to,
      subject: `Test email — ${tenant.name}`,
      html: buildTestEmailHtml(tenant.name),
      smtp: config,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec de l\'envoi';
    return res.status(400).json({ error: `Test échoué : ${message}` });
  }

  return res.json({ success: true, sentTo: to });
}
