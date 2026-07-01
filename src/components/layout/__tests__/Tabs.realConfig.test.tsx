import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Tabs } from '../Tabs';
import { useAuth } from '../../../auth/AuthContext';

// Utilise tabsConfig réel (pas de mock) : verrouille les critères d'acceptation de la spec
// "look n feel hockey-tournoi" portant sur les 3 items toujours visibles du bandeau, avec leurs
// libellés réels (longs en haut, courts en bas).
vi.mock('../../../auth/AuthContext');

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

describe('Tabs — tabsConfig réel', () => {
  beforeEach(() => {
    mockAuth();
  });

  it('top variant: shows exactly the 3 primary tabs with their full labels, in order', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Accueil',
      'Mes disponibilités',
      "Disponibilités de l'effectif",
    ]);
  });

  it('bottom variant: shows exactly the 3 primary tabs with their short labels, in order', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="bottom" />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Accueil', 'Mes dispos', 'Disponibilités']);
  });

  it('marks the active route with the "is-active" class, consistently between top and bottom variants', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/mes-disponibilites']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Mes disponibilités' })).toHaveClass('is-active');
    unmount();

    render(
      <MemoryRouter initialEntries={['/mes-disponibilites']}>
        <Tabs variant="bottom" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Mes dispos' })).toHaveClass('is-active');
  });

  it('never shows an admin tab among the primary tabs, even for an admin user', () => {
    mockAuth({
      user: { id: 'admin-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Tabs variant="top" />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('link', { name: /Gestion des activités/ })).not.toBeInTheDocument();
  });
});
