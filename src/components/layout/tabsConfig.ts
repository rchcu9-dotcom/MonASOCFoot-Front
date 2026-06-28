export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  /** Si `true`, le tab n'est affiché que si l'utilisateur connecté a le rôle `admin`. */
  requiresAdmin?: boolean;
  /** Si `true`, le tab est mis en avant dans le bandeau (haut en desktop, bas en mobile). */
  primary?: boolean;
}

export const tabsConfig: TabConfig[] = [
  { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
  {
    id: 'disponibilites-effectif',
    label: 'Disponibilités de l\'effectif',
    shortLabel: 'Disponibilités',
    path: '/disponibilites/effectif',
  },
  {
    id: 'admin-activites',
    label: 'Gestion des activités',
    shortLabel: 'Activités',
    path: '/admin/activites',
    requiresAdmin: true,
  },
  {
    id: 'admin-utilisateurs',
    label: 'Gestion des utilisateurs',
    shortLabel: 'Utilisateurs',
    path: '/admin/utilisateurs',
    requiresAdmin: true,
  },
];
