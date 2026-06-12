import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { clearAuthSession } from '../../../lib/auth-session';
import { useAuth } from '../hooks/use-auth';

/** Bloque l'interface tant qu'aucun utilisateur n'est authentifié côté API. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || error) {
      clearAuthSession();
      const redirect = window.location.pathname + window.location.search;
      void navigate({
        to: '/auth/login',
        search: { redirect },
      });
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
