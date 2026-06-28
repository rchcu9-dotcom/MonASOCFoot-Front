import { describe, it, expect, vi } from 'vitest';

describe('getBreadcrumbItems', () => {
  it('returns no breadcrumb on the root route', async () => {
    const { getBreadcrumbItems } = await import('../breadcrumbsConfig');

    expect(getBreadcrumbItems('/')).toEqual([]);
  });

  it('returns no breadcrumb for a route absent from tabsConfig', async () => {
    const { getBreadcrumbItems } = await import('../breadcrumbsConfig');

    expect(getBreadcrumbItems('/inconnu')).toEqual([]);
  });

  // tabsConfig ne contient pour l'instant que la route Accueil (cf. decisions.json) : ce test
  // mocke un tab supplémentaire pour vérifier que la dérivation tabsConfig -> breadcrumbsConfig
  // fonctionnera bien dès qu'une future spec ajoutera ses propres routes top-level.
  it('derives a breadcrumb trail from a future top-level tab', async () => {
    vi.resetModules();
    vi.doMock('../tabsConfig', () => ({
      tabsConfig: [
        { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
        { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos', primary: true },
      ],
    }));

    const { getBreadcrumbItems } = await import('../breadcrumbsConfig');

    expect(getBreadcrumbItems('/dispos')).toEqual([
      { label: 'Accueil', path: '/' },
      { label: 'Mes disponibilités' },
    ]);

    vi.doUnmock('../tabsConfig');
    vi.resetModules();
  });
});
