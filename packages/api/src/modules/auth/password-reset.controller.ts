import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { randomUUID } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '../../lib/db';
import { sendEmail, buildPasswordResetEmailHtml, isEmailConfigured } from '../../lib/email';

const RESET_TOKEN_TTL_MINUTES = 60;
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(6),
});

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function forgotPassword(req: Request, res: Response) {
  const parse = forgotPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const { email } = parse.data;

  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, email), eq(schema.users.isActive, true)))
    .limit(1);

  // Réponse identique que l'email existe ou non (sécurité)
  const successMessage =
    'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

  if (!user) {
    return res.json({ success: true, message: successMessage });
  }

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, user.tenantId))
    .limit(1);

  if (!isEmailConfigured(tenant)) {
    return res.status(503).json({
      error: 'Le service email n\'est pas configuré. Contactez l\'administrateur.',
    });
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  // Invalider les anciens liens non utilisés pour cet utilisateur
  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(schema.passwordResetTokens.userId, user.id),
        isNull(schema.passwordResetTokens.usedAt),
      ),
    );

  await db.insert(schema.passwordResetTokens).values({
    id: randomUUID(),
    userId: user.id,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: now,
  });

  const resetUrl = `${APP_URL.replace(/\/$/, '')}/auth/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe — GestFacturation',
      html: buildPasswordResetEmailHtml({
        firstName: user.firstName,
        resetUrl,
        expiresMinutes: RESET_TOKEN_TTL_MINUTES,
      }),
      tenant,
    });
  } catch {
    return res.status(500).json({
      error: 'Impossible d\'envoyer l\'email. Réessayez plus tard.',
    });
  }

  return res.json({ success: true, message: successMessage });
}

export async function resetPassword(req: Request, res: Response) {
  const parse = resetPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { token, password } = parse.data;
  const tokenHash = hashToken(token);
  const now = new Date();

  const [resetRow] = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);

  if (!resetRow) {
    return res.status(400).json({ error: 'Lien invalide ou expiré. Demandez un nouveau lien.' });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, resetRow.userId))
    .limit(1);

  if (!user || !user.isActive) {
    return res.status(400).json({ error: 'Compte introuvable ou désactivé.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    await tx
      .update(schema.users)
      .set({ passwordHash, updatedAt: now })
      .where(eq(schema.users.id, user.id));

    await tx
      .update(schema.passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(schema.passwordResetTokens.id, resetRow.id));
  });

  return res.json({
    success: true,
    message: 'Mot de passe mis à jour. Vous pouvez vous connecter.',
  });
}

export async function validateResetToken(req: Request, res: Response) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token || token.length < 32) {
    return res.status(400).json({ valid: false });
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  const [resetRow] = await db
    .select({ id: schema.passwordResetTokens.id })
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);

  return res.json({ valid: Boolean(resetRow) });
}
