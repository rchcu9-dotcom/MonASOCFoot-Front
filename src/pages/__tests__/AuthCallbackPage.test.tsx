import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthCallbackPage } from '../AuthCallbackPage';
import { useAuth } from '../../auth/AuthContext';
import { getToken, clearToken } from '../../auth/authToken';

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

function renderCallback(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    clearToken();
  });

  it("affiche un message d'échec et ne stocke aucun token quand le query param token est absent", () => {
    const refresh = vi.fn();
    mockAuth({ refresh });

    renderCallback('/auth/callback');

    expect(screen.getByText('Connexion impossible')).toBeInTheDocument();
    expect(getToken()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('stocke le token reçu, appelle refresh(), puis navigue vers / en remplaçant l\'historique', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    mockAuth({ refresh });

    renderCallback('/auth/callback?token=jwt-recu');

    await waitFor(() => expect(getToken()).toBe('jwt-recu'));
    expect(refresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('Accueil')).toBeInTheDocument());
  });

  it('affiche un message de connexion en cours tant que le token est présent et la navigation pas encore effectuée', () => {
    const refresh = vi.fn().mockReturnValue(new Promise(() => {}));
    mockAuth({ refresh });

    renderCallback('/auth/callback?token=jwt-recu');

    expect(screen.getByText('Connexion en cours…')).toBeInTheDocument();
  });
});
