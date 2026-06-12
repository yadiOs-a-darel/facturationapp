import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';

import { getSession } from '../features/auth/api/client';
import { clearAuthSession, hasValidAuthSession } from './auth-session';
import { QueryKeys } from './query';

export async function ensureAuthenticatedSession(
  queryClient: QueryClient,
  redirectPath: string,
): Promise<void> {
  if (!hasValidAuthSession()) {
    throw redirect({
      to: '/auth/login',
      search: { redirect: redirectPath },
    });
  }

  try {
    const data = await queryClient.fetchQuery({
      queryKey: QueryKeys.session,
      queryFn: async () => {
        const result = await getSession();
        if (result.error || !result.data?.user) {
          throw result.error ?? new Error('Session invalide');
        }
        return result.data;
      },
      staleTime: 0,
    });

    if (!data?.user) {
      throw new Error('Session invalide');
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'isRedirect' in err) {
      throw err;
    }
    clearAuthSession();
    queryClient.removeQueries({ queryKey: QueryKeys.session });
    throw redirect({
      to: '/auth/login',
      search: { redirect: redirectPath },
    });
  }
}
