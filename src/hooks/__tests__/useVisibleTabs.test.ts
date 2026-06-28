import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVisibleTabs } from '../useVisibleTabs';
import { useAuth } from '../../auth/AuthContext';

vi.mock('../../auth/AuthContext');

// tabsConfig ne contient pour l'instant que la route Accueil (non admin) : ce mock ajoute un
// tab requiresAdmin pour exercer le filtrage par rôle, en anticipation des futures specs
// (gestion-activites-admin, gestion-utilisateurs-admin-monasocfoot) qui en ajouteront un réel.
vi.mock('../../components/layout/tabsConfig', () => ({
  tabsConfig: [
    { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
    { id: 'admin', label: 'Admin', shortLabel: 'Admin', path: '/admin', requiresAdmin: true },
  ],
}));

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

describe('useVisibleTabs', () => {
  it('includes the admin-only tab when the connected user has the admin role', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    const { result } = renderHook(() => useVisibleTabs());

    expect(result.current.find((tab) => tab.id === 'admin')).toMatchObject({ id: 'admin', path: '/admin' });
  });

  it('hides the admin-only tab when no user is connected', () => {
    mockAuth({ user: null, loading: false });

    const { result } = renderHook(() => useVisibleTabs());

    expect(result.current.find((tab) => tab.id === 'admin')).toBeUndefined();
  });

  it('hides the admin-only tab while the auth state is loading, even for an eventual admin', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
      loading: true,
    });

    const { result } = renderHook(() => useVisibleTabs());

    expect(result.current.find((tab) => tab.id === 'admin')).toBeUndefined();
  });

  it('hides the admin-only tab when the connected user has the joueur role', () => {
    mockAuth({
      user: { id: 'user-2', providerId: 'joueur@example.com', provider: 'dev', displayName: 'Joueur', role: 'joueur' },
      loading: false,
    });

    const { result } = renderHook(() => useVisibleTabs());

    expect(result.current.find((tab) => tab.id === 'admin')).toBeUndefined();
  });

  it('always shows the Accueil tab and preserves tabsConfig order', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    const { result } = renderHook(() => useVisibleTabs());

    expect(result.current.map((tab) => tab.id)).toEqual(['accueil', 'admin']);
  });
});
