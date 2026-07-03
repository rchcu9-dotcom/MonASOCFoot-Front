import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuthRoute } from '../RequireAuthRoute';
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
    <MemoryRouter initialEntries={['/profil']}>
      <Routes>
        <Route path="/login" element={<p>Connexion</p>} />
        <Route
          path="/profil"
          element={
            <RequireAuthRoute>
              <p>Mon profil</p>
            </RequireAuthRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuthRoute', () => {
  it("n'affiche rien pendant le chargement de l'état d'authentification", () => {
    mockAuth({ loading: true });

    renderGuarded();

    expect(screen.queryByText('Mon profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
  });

  it("redirige vers '/login' quand aucun utilisateur n'est connecté", () => {
    mockAuth({ user: null });

    renderGuarded();

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.queryByText('Mon profil')).not.toBeInTheDocument();
  });

  it('affiche les enfants pour tout utilisateur connecté, sans exiger de rôle particulier (joueur)', () => {
    mockAuth({
      user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Joueur', role: 'joueur' },
    });

    renderGuarded();

    expect(screen.getByText('Mon profil')).toBeInTheDocument();
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
  });

  it('affiche les enfants pour un utilisateur connecté avec le rôle admin', () => {
    mockAuth({
      user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    renderGuarded();

    expect(screen.getByText('Mon profil')).toBeInTheDocument();
  });
});
