export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  /** Si `true`, le tab n'est affiché que si l'utilisateur connecté a le rôle `admin`. */
  requiresAdmin?: boolean;
  /** Si `true`, le tab n'est affiché que si un utilisateur est connecté (quel que soit son rôle). */
  requiresAuth?: boolean;
  /** Si `true`, le tab est mis en avant dans le bandeau (haut en desktop, bas en mobile). */
  primary?: boolean;
}

export const tabsConfig: TabConfig[] = [
  { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
  {
    id: 'mes-disponibilites',
    label: 'Mes disponibilités',
    shortLabel: 'Mes dispos',
    path: '/mes-disponibilites',
    primary: true,
  },
  {
    id: 'disponibilites-effectif',
    label: 'Disponibilités de l\'effectif',
    shortLabel: 'Disponibilités',
    path: '/disponibilites/effectif',
    primary: true,
  },
  {
    id: 'admin-activites',
    label: 'Gestion des activités',
    shortLabel: 'Activités',
    path: '/admin/activites',
    requiresAdmin: true,
  },
  {
    id: 'admin-planification-activites',
    label: 'Planification des activités',
    shortLabel: 'Planification',
    path: '/admin/activites/planification',
    requiresAdmin: true,
  },
  {
    id: 'admin-utilisateurs',
    label: 'Gestion des utilisateurs',
    shortLabel: 'Utilisateurs',
    path: '/admin/utilisateurs',
    requiresAdmin: true,
  },
  {
    id: 'profil',
    label: 'Mon profil',
    shortLabel: 'Profil',
    path: '/profil',
    requiresAuth: true,
  },
];
