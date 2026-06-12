import { apiClient } from '../../../lib/api-client';

export interface EmailSettings {
  configured: boolean;
  source: 'tenant' | 'env' | 'none';
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpFrom: string | null;
  hasPassword: boolean;
  usingEnvFallback: boolean;
}

export interface UpdateEmailSettingsPayload {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass?: string;
  smtpFrom: string;
}

export async function fetchEmailSettings(): Promise<EmailSettings> {
  const { data } = await apiClient.get<EmailSettings>('/tenants/me/email-settings');
  return data;
}

export async function updateEmailSettings(payload: UpdateEmailSettingsPayload) {
  const { data } = await apiClient.put<{ success: boolean; message: string }>(
    '/tenants/me/email-settings',
    payload,
  );
  return data;
}

export async function testEmailSettings(to?: string) {
  const { data } = await apiClient.post<{ success: boolean; sentTo: string }>(
    '/tenants/me/email-settings/test',
    to ? { to } : {},
  );
  return data;
}
