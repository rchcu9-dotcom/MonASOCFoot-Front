import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  children: ReactNode;
}

/**
 * Garde de route — protège l'accès direct par URL aux pages réservées au rôle
 * `admin`. Complète le masquage de menu (`useVisibleTabs`) : le contrôle
 * d'accès réel doit toujours venir du back (defense in depth), cette garde
 * n'est qu'un confort UX côté front.
 */
export function RequireAdminRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
