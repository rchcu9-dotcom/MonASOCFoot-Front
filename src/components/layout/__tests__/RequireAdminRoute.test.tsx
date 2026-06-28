import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAdminRoute } from '../RequireAdminRoute';
import { useAuth } from '../../../auth/AuthContext';

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

function renderGuarded() {
  return render(
    <MemoryRouter initialEntries={['/admin/activites']}>
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route
          path="/admin/activites"
          element={
            <RequireAdminRoute>
              <p>Page admin</p>
            </RequireAdminRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAdminRoute', () => {
  it("n'affiche rien pendant le chargement de l'état d'authentification", () => {
    mockAuth({ loading: true });

    renderGuarded();

    expect(screen.queryByText('Page admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Accueil')).not.toBeInTheDocument();
  });

  it("redirige vers '/' quand aucun utilisateur n'est connecté", () => {
    mockAuth({ user: null });

    renderGuarded();

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.queryByText('Page admin')).not.toBeInTheDocument();
  });

  it("redirige vers '/' quand l'utilisateur connecté n'a pas le rôle admin", () => {
    mockAuth({
      user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Joueur', role: 'joueur' },
    });

    renderGuarded();

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.queryByText('Page admin')).not.toBeInTheDocument();
  });

  it("affiche les enfants quand l'utilisateur connecté a le rôle admin", () => {
    mockAuth({
      user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    renderGuarded();

    expect(screen.getByText('Page admin')).toBeInTheDocument();
    expect(screen.queryByText('Accueil')).not.toBeInTheDocument();
  });
});
