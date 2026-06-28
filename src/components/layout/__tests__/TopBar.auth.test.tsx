import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { useAuth } from '../../../auth/AuthContext';

// Isolé dans son propre fichier car il mocke useAuth directement (plutôt que de passer par
// un vrai AuthProvider comme TopBar.test.tsx), pour contrôler l'état "utilisateur connecté".
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

function renderTopBar() {
  return render(
    <MemoryRouter>
      <TopBar />
    </MemoryRouter>,
  );
}

describe('TopBar — zone authentification', () => {
  it('shows the display name and a Déconnexion button when a user is connected', () => {
    mockAuth({
      user: { id: 'user-1', providerId: 'joueur@example.com', provider: 'dev', displayName: 'Jean Joueur', role: 'joueur' },
    });

    renderTopBar();

    expect(screen.getByText('Jean Joueur')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Déconnexion' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
  });

  it('calls logout when clicking Déconnexion', () => {
    const logout = vi.fn();
    mockAuth({
      user: { id: 'user-1', providerId: 'joueur@example.com', provider: 'dev', displayName: 'Jean Joueur', role: 'joueur' },
      logout,
    });

    renderTopBar();

    screen.getByRole('button', { name: 'Déconnexion' }).click();

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('shows nothing in the auth zone while the auth state is loading', () => {
    mockAuth({ loading: true });

    renderTopBar();

    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Déconnexion' })).not.toBeInTheDocument();
  });
});
