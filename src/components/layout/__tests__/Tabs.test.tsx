import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Tabs } from '../Tabs';
import { useAuth } from '../../../auth/AuthContext';

vi.mock('../../../auth/AuthContext');

// tabsConfig ne contient pour l'instant que la route Accueil : ce mock ajoute un tab primaire
// supplémentaire et un tab requiresAdmin pour vérifier la combinaison primary + rôle.
vi.mock('../tabsConfig', () => ({
  tabsConfig: [
    { id: 'accueil', label: 'Accueil', shortLabel: 'Accueil', path: '/', primary: true },
    { id: 'dispos', label: 'Mes disponibilités', shortLabel: 'Dispos', path: '/dispos', primary: true },
    { id: 'admin', label: 'Admin', shortLabel: 'Admin', path: '/admin', requiresAdmin: true, primary: true },
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

describe('Tabs', () => {
  beforeEach(() => {
    mockAuth();
  });

  it('renders every visible primary tab and marks the active route', () => {
    render(
      <MemoryRouter initialEntries={['/dispos']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mes disponibilités' })).toHaveClass('is-active');
  });

  it('uses short labels for the bottom variant', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="bottom" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Dispos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveClass('is-active');
  });

  it('hides the Admin tab for a non-admin user, even though it is flagged primary', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'joueur@example.com', provider: 'dev', displayName: 'Joueur', role: 'joueur' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('shows the Admin tab for an admin user', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });
});
