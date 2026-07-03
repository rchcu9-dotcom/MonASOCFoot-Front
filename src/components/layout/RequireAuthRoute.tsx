import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  children: ReactNode;
}

/**
 * Garde de route — protège l'accès direct par URL aux pages nécessitant une session, sans
 * exiger de rôle particulier (contrairement à `RequireAdminRoute`). Le contrôle d'accès réel
 * doit toujours venir du back (defense in depth), cette garde n'est qu'un confort UX côté front.
 */
export function RequireAuthRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
