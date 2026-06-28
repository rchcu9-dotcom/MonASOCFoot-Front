import { describe, it, expect } from 'vitest';
import { tabsConfig } from '../tabsConfig';

describe('tabsConfig', () => {
  it('exposes the Accueil tab as the only primary entry, pointing at the root route', () => {
    const accueil = tabsConfig.find((tab) => tab.id === 'accueil');

    expect(accueil).toEqual({ id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true });
    expect(tabsConfig.filter((tab) => tab.primary)).toEqual([accueil]);
  });

  it('does not mark Accueil as admin-only', () => {
    const accueil = tabsConfig.find((tab) => tab.id === 'accueil');

    expect(accueil?.requiresAdmin).toBeFalsy();
  });

  it('exposes the "disponibilites-effectif" tab as a secondary, non-admin entry', () => {
    const effectif = tabsConfig.find((tab) => tab.id === 'disponibilites-effectif');

    expect(effectif).toEqual({
      id: 'disponibilites-effectif',
      label: "Disponibilités de l'effectif",
      shortLabel: 'Disponibilités',
      path: '/disponibilites/effectif',
    });
    expect(effectif?.primary).toBeFalsy();
    expect(effectif?.requiresAdmin).toBeFalsy();
  });

  it('exposes the "admin-activites" tab as admin-only, pointing at /admin/activites', () => {
    const activites = tabsConfig.find((tab) => tab.id === 'admin-activites');

    expect(activites).toEqual({
      id: 'admin-activites',
      label: 'Gestion des activités',
      shortLabel: 'Activités',
      path: '/admin/activites',
      requiresAdmin: true,
    });
    expect(activites?.primary).toBeFalsy();
  });

  it('exposes the "admin-utilisateurs" tab as admin-only, pointing at /admin/utilisateurs', () => {
    const utilisateurs = tabsConfig.find((tab) => tab.id === 'admin-utilisateurs');

    expect(utilisateurs).toEqual({
      id: 'admin-utilisateurs',
      label: 'Gestion des utilisateurs',
      shortLabel: 'Utilisateurs',
      path: '/admin/utilisateurs',
      requiresAdmin: true,
    });
    expect(utilisateurs?.primary).toBeFalsy();
  });
});
