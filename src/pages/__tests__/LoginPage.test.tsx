import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../auth/AuthContext';

vi.mock('../../auth/AuthContext');

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

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("redirige vers '/' quand un utilisateur est déjà connecté", () => {
    mockAuth({
      user: { id: 'u1', providerId: 'p1', provider: 'dev', displayName: 'Jean Joueur', role: 'joueur' },
    });

    renderLoginPage();

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
  });

  it("affiche le lien de connexion Google pointant vers googleLoginUrl et le formulaire dev-login quand non connecté", () => {
    mockAuth({ user: null });

    renderLoginPage();

    const googleLink = screen.getByRole('link', { name: 'Se connecter avec Google' });
    expect(googleLink).toHaveAttribute('href', 'http://localhost:3020/auth/google');
    expect(screen.getByRole('button', { name: 'Connexion test' })).toBeInTheDocument();
  });

  it('appelle devLogin avec les valeurs saisies à la soumission du formulaire', async () => {
    const devLogin = vi.fn().mockResolvedValue(undefined);
    mockAuth({ user: null, devLogin });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'joueur@example.com' } });
    fireEvent.change(screen.getByLabelText('Nom affiché'), { target: { value: 'Jean Joueur' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connexion test' }));

    await waitFor(() => expect(devLogin).toHaveBeenCalledWith('joueur@example.com', 'Jean Joueur'));
  });

  it("affiche un message d'erreur quand devLogin rejette", async () => {
    const devLogin = vi.fn().mockRejectedValue(new Error('dev-login désactivé en production'));
    mockAuth({ user: null, devLogin });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'joueur@example.com' } });
    fireEvent.change(screen.getByLabelText('Nom affiché'), { target: { value: 'Jean Joueur' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connexion test' }));

    await waitFor(() =>
      expect(screen.getByText('dev-login désactivé en production')).toBeInTheDocument(),
    );
  });

  it("désactive le bouton de soumission pendant l'appel à devLogin (pending)", async () => {
    let resolveDevLogin: () => void = () => {};
    const devLogin = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDevLogin = resolve;
        }),
    );
    mockAuth({ user: null, devLogin });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'joueur@example.com' } });
    fireEvent.change(screen.getByLabelText('Nom affiché'), { target: { value: 'Jean Joueur' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connexion test' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Connexion test' })).toBeDisabled());

    resolveDevLogin();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Connexion test' })).not.toBeDisabled());
  });
});
