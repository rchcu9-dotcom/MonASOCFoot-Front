import { tabsConfig, type TabConfig } from '../components/layout/tabsConfig';
import { useAuth } from '../auth/AuthContext';

/**
 * Filtre `tabsConfig` selon le rôle de l'utilisateur connecté. Logique
 * partagée entre `Tabs` et `HamburgerMenu` pour garder le même menu visible
 * quel que soit le mode d'affichage.
 */
export function useVisibleTabs(): TabConfig[] {
  const { user, loading } = useAuth();

  return tabsConfig.filter((tab) => {
    if (tab.requiresAdmin) {
      return !loading && user?.role === 'admin';
    }
    if (tab.requiresAuth) {
      return !loading && user != null;
    }
    return true;
  });
}
