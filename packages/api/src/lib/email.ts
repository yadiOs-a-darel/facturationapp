import nodemailer from 'nodemailer';

const ENV_SMTP_HOST = process.env.SMTP_HOST;
const ENV_SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const ENV_SMTP_USER = process.env.SMTP_USER;
const ENV_SMTP_PASS = process.env.SMTP_PASS;
const ENV_SMTP_FROM = process.env.SMTP_FROM ?? 'noreply@gestfacturation.local';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  source: 'tenant' | 'env';
}

export type TenantSmtpFields = {
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
};

export function resolveSmtpConfig(tenant?: TenantSmtpFields | null): SmtpConfig | null {
  if (tenant?.smtpHost && tenant.smtpUser && tenant.smtpPass) {
    return {
      host: tenant.smtpHost,
      port: tenant.smtpPort ?? 587,
      user: tenant.smtpUser,
      pass: tenant.smtpPass,
      from: tenant.smtpFrom ?? tenant.smtpUser,
      source: 'tenant',
    };
  }

  if (ENV_SMTP_HOST && ENV_SMTP_USER && ENV_SMTP_PASS) {
    return {
      host: ENV_SMTP_HOST,
      port: ENV_SMTP_PORT,
      user: ENV_SMTP_USER,
      pass: ENV_SMTP_PASS,
      from: ENV_SMTP_FROM,
      source: 'env',
    };
  }

  return null;
}

export function isEmailConfigured(tenant?: TenantSmtpFields | null): boolean {
  return resolveSmtpConfig(tenant) !== null;
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  smtp?: SmtpConfig | null;
  tenant?: TenantSmtpFields | null;
}) {
  const config = params.smtp ?? resolveSmtpConfig(params.tenant);
  if (!config) {
    throw new Error('Configuration SMTP manquante');
  }

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: params.from ?? config.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export async function verifySmtpConfig(config: SmtpConfig): Promise<void> {
  const transporter = createTransporter(config);
  await transporter.verify();
}

export function buildPasswordResetEmailHtml(params: {
  firstName: string;
  resetUrl: string;
  expiresMinutes: number;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #111;">Réinitialisation du mot de passe</h2>
      <p>Bonjour ${params.firstName},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe GestFacturation.</p>
      <p style="margin: 24px 0;">
        <a href="${params.resetUrl}"
           style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; font-weight: 600;">
          Choisir un nouveau mot de passe
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">
        Ce lien expire dans ${params.expiresMinutes} minutes. Si vous n'êtes pas à l'origine de cette demande,
        ignorez cet email — votre mot de passe restera inchangé.
      </p>
      <p style="font-size: 12px; color: #999; word-break: break-all;">${params.resetUrl}</p>
    </div>
  `;
}

export function buildInvoiceEmailHtml(params: {
  companyName: string;
  invoiceNumber: string;
  totalTTC: string;
  dueDate?: string | null;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>${params.companyName}</h2>
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-joint les informations de votre facture <strong>${params.invoiceNumber}</strong>.</p>
      <p>Montant TTC : <strong>${params.totalTTC} DZD</strong></p>
      ${params.dueDate ? `<p>Échéance : ${params.dueDate}</p>` : ''}
      <p>Cordialement,<br/>${params.companyName}</p>
    </div>
  `;
}

export function buildCashierDailyEmailHtml(params: {
  companyName: string;
  date: string;
  cashiers: Array<{
    firstName: string;
    lastName: string;
    activities: Array<{
      label: string;
      reference: string;
      amount: number | null;
      status: string | null;
      at: string;
      details: string | null;
    }>;
    paymentsTotal: number;
    invoicesCount: number;
  }>;
  totals: Record<string, number>;
}) {
  const formatAmount = (n: number | null) =>
    n == null ? '—' : `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;

  const cashierSections = params.cashiers
    .map((c) => {
      const rows = c.activities
        .map(
          (a) => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${new Date(a.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${a.label}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${a.reference}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${a.status ?? '—'}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(a.amount)}</td>
        </tr>`,
        )
        .join('');

      return `
        <h3 style="margin-top:24px;">${c.firstName} ${c.lastName}</h3>
        <p style="color:#666;font-size:13px;">${c.invoicesCount} opération(s) · Paiements : ${formatAmount(c.paymentsTotal)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:6px;text-align:left;">Heure</th>
              <th style="padding:6px;text-align:left;">Type</th>
              <th style="padding:6px;text-align:left;">Réf.</th>
              <th style="padding:6px;text-align:left;">Statut</th>
              <th style="padding:6px;text-align:right;">Montant</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5" style="padding:12px;color:#999;">Aucune activité</td></tr>'}</tbody>
        </table>`;
    })
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:800px;margin:0 auto;">
      <h2>Journal caisse — ${params.date}</h2>
      <p><strong>${params.companyName}</strong></p>
      <p style="color:#666;">
        ${params.totals.activityCount ?? 0} opération(s) ·
        Paiements : ${formatAmount(params.totals.paymentsTotal ?? 0)} ·
        Dépenses : ${formatAmount(params.totals.expensesTotal ?? 0)}
      </p>
      ${cashierSections || '<p>Aucune activité caissier ce jour.</p>'}
    </div>
  `;
}

export function buildTestEmailHtml(companyName: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>Test email — GestFacturation</h2>
      <p>Bonjour,</p>
      <p>Ceci est un email de test envoyé depuis la configuration SMTP de <strong>${companyName}</strong>.</p>
      <p>Si vous recevez ce message, le service email est correctement configuré.</p>
    </div>
  `;
}
