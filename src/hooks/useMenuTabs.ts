import type { TabConfig } from '../components/layout/tabsConfig';
import { useVisibleTabs } from './useVisibleTabs';

export interface MenuTabs {
  /** Tous les items visibles pour l'utilisateur (filtrage rôle déjà appliqué). */
  allTabs: TabConfig[];
  /** Les items mis en avant dans le bandeau (haut en desktop, bas en mobile). */
  primaryTabs: TabConfig[];
  /** Le reste des items visibles, accessible via le menu "Plus"/hamburger complet. */
  secondaryTabs: TabConfig[];
}

/**
 * Point de vérité unique pour répartir les items de navigation visibles entre
 * bandeau ("primaryTabs") et menu "Plus"/hamburger ("secondaryTabs"), partagé
 * par `Tabs` et `TopBar` pour éviter toute divergence entre les rendus.
 */
export function useMenuTabs(): MenuTabs {
  const allTabs = useVisibleTabs();

  return {
    allTabs,
    primaryTabs: allTabs.filter((tab) => tab.primary),
    secondaryTabs: allTabs.filter((tab) => !tab.primary),
  };
}
