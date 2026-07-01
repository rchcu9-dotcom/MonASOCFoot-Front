import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '../TopBar';
import { useAuth } from '../../../auth/AuthContext';

// Utilise tabsConfig réel avec un utilisateur admin mocké (useAuth, comme TopBar.auth.test.tsx) :
// couvre le cas où le bouton "Plus" réapparaît avec les 3 tabs admin réels, distinct du cas
// anonyme (aucun tab secondaire visible) couvert par TopBar.test.tsx.
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

describe('TopBar — utilisateur admin (tabsConfig réel)', () => {
  it('shows the "Plus" button with the 3 admin tabs, none of the 3 primary tabs', () => {
    mockAuth({
      user: { id: 'admin-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    renderTopBar();

    const more = screen.getByRole('button', { name: "Plus d'options de navigation" });
    fireEvent.click(more);

    expect(screen.getByRole('menuitem', { name: 'Gestion des activités' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Planification des activités' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gestion des utilisateurs' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Accueil' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Mes disponibilités' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: "Disponibilités de l'effectif" })).not.toBeInTheDocument();
  });

  it('still shows the 3 primary tabs in the top navigation for an admin user', () => {
    mockAuth({
      user: { id: 'admin-1', providerId: 'admin@example.com', provider: 'dev', displayName: 'Admin', role: 'admin' },
    });

    renderTopBar();

    expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mes disponibilités' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "Disponibilités de l'effectif" })).toBeInTheDocument();
  });
});
