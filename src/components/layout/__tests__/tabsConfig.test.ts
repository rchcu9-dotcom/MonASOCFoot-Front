import { describe, it, expect } from 'vitest';
import { tabsConfig } from '../tabsConfig';

describe('tabsConfig', () => {
  it('exposes exactly 3 primary entries, in this order: Accueil, Mes disponibilités, Disponibilités de l\'effectif', () => {
    expect(tabsConfig.filter((tab) => tab.primary).map((tab) => tab.id)).toEqual([
      'accueil',
      'mes-disponibilites',
      'disponibilites-effectif',
    ]);
  });

  it('does not mark Accueil as admin-only', () => {
    const accueil = tabsConfig.find((tab) => tab.id === 'accueil');

    expect(accueil).toEqual({ id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true });
    expect(accueil?.requiresAdmin).toBeFalsy();
  });

  it('exposes the "mes-disponibilites" tab as a primary, non-admin entry', () => {
    const mesDispos = tabsConfig.find((tab) => tab.id === 'mes-disponibilites');

    expect(mesDispos).toEqual({
      id: 'mes-disponibilites',
      label: 'Mes disponibilités',
      shortLabel: 'Mes dispos',
      path: '/mes-disponibilites',
      primary: true,
    });
    expect(mesDispos?.requiresAdmin).toBeFalsy();
  });

  it('exposes the "disponibilites-effectif" tab as a primary, non-admin entry', () => {
    const effectif = tabsConfig.find((tab) => tab.id === 'disponibilites-effectif');

    expect(effectif).toEqual({
      id: 'disponibilites-effectif',
      label: "Disponibilités de l'effectif",
      shortLabel: 'Disponibilités',
      path: '/disponibilites/effectif',
      primary: true,
    });
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

  it('exposes the "profil" tab pointing at /profil, visible to any connected user (not admin-only, not primary)', () => {
    const profil = tabsConfig.find((tab) => tab.id === 'profil');

    expect(profil).toEqual({
      id: 'profil',
      label: 'Mon profil',
      shortLabel: 'Profil',
      path: '/profil',
      requiresAuth: true,
    });
    expect(profil?.requiresAdmin).toBeFalsy();
    expect(profil?.primary).toBeFalsy();
  });
});
