import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { getToken } from '../authToken';

// Capture la valeur du hook après le rendu (dans un effet) pour l'exposer aux assertions du
// test, sans muter de variable pendant le rendu (react-hooks/immutability).
function Capture({ onCapture }: { onCapture: (value: ReturnType<typeof useAuth>) => void }) {
  const value = useAuth();
  useEffect(() => {
    onCapture(value);
  });
  return null;
}

// AuthContext fait des `fetch` directs vers l'API (pas de mock de module `authFetch` : c'est lui
// qui gère le token avant que les autres hooks/fonctions API n'existent). On mocke donc
// `global.fetch` directement, avec restauration systématique en `afterEach`.

function TestConsumer() {
  const { user, loading, googleLoginUrl, devLogin, refresh, logout } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="user">{user ? `${user.displayName} (${user.role})` : 'none'}</p>
      <p data-testid="google-url">{googleLoginUrl}</p>
      <button onClick={() => void devLogin('joueur@example.com', 'Jean Joueur')}>dev-login</button>
      <button onClick={() => void refresh()}>refresh</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const utilisateur = {
  id: 'u1',
  providerId: 'joueur@example.com',
  provider: 'dev',
  displayName: 'Jean Joueur',
  role: 'joueur' as const,
};

describe('AuthContext / useAuth', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it("au montage sans token stocké, ne fait aucun appel réseau et passe loading=false avec user=null", async () => {
    global.fetch = vi.fn();

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('charge le profil via GET /auth/me au montage quand un token est déjà stocké', async () => {
    localStorage.setItem('monasocfoot_auth_token', 'jwt-existant');
    global.fetch = vi.fn().mockResolvedValue(mockJsonResponse(utilisateur));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Jean Joueur (joueur)'));
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3020/auth/me', {
      headers: { Authorization: 'Bearer jwt-existant' },
    });
  });

  it('efface le token et garde user=null quand /auth/me répond non-ok (token invalide/expiré)', async () => {
    localStorage.setItem('monasocfoot_auth_token', 'jwt-invalide');
    global.fetch = vi.fn().mockResolvedValue(mockJsonResponse(null, false, 401));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(getToken()).toBeNull();
  });

  it('expose googleLoginUrl pointant vers <API_BASE_URL>/auth/google', async () => {
    global.fetch = vi.fn();

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('google-url').textContent).toBe('http://localhost:3020/auth/google');
  });

  describe('devLogin', () => {
    it('POST /auth/dev-login avec { email, displayName }, stocke le token reçu puis recharge le profil', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url === 'http://localhost:3020/auth/dev-login') {
          return Promise.resolve(mockJsonResponse({ token: 'nouveau-jwt' }));
        }
        if (url === 'http://localhost:3020/auth/me') {
          return Promise.resolve(mockJsonResponse(utilisateur));
        }
        throw new Error(`URL inattendue: ${url}`);
      });
      global.fetch = fetchMock;

      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      fireEvent.click(screen.getByRole('button', { name: 'dev-login' }));

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Jean Joueur (joueur)'));
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3020/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'joueur@example.com', displayName: 'Jean Joueur' }),
      });
      expect(getToken()).toBe('nouveau-jwt');
    });

    it("lève une erreur avec le message du body quand dev-login échoue (ex: 403 désactivé en production)", async () => {
      global.fetch = vi.fn().mockResolvedValue(mockJsonResponse({ message: 'dev-login désactivé en production' }, false, 403));

      const capturedRef: { current: ReturnType<typeof useAuth> | null } = { current: null };
      render(
        <AuthProvider>
          <Capture onCapture={(value) => { capturedRef.current = value; }} />
        </AuthProvider>,
      );
      await waitFor(() => expect(capturedRef.current?.loading).toBe(false));

      await expect(capturedRef.current!.devLogin('x@example.com', 'X')).rejects.toThrow(
        'dev-login désactivé en production',
      );
      expect(getToken()).toBeNull();
    });

    it("lève une erreur avec un message par défaut quand le body n'est pas exploitable", async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockJsonResponse(null, false, 500),
      );

      const capturedRef: { current: ReturnType<typeof useAuth> | null } = { current: null };
      render(
        <AuthProvider>
          <Capture onCapture={(value) => { capturedRef.current = value; }} />
        </AuthProvider>,
      );
      await waitFor(() => expect(capturedRef.current?.loading).toBe(false));

      await expect(capturedRef.current!.devLogin('x@example.com', 'X')).rejects.toThrow('Erreur 500');
    });
  });

  describe('logout', () => {
    it('efface le token et remet user=null', async () => {
      localStorage.setItem('monasocfoot_auth_token', 'jwt-existant');
      global.fetch = vi.fn().mockResolvedValue(mockJsonResponse(utilisateur));

      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Jean Joueur (joueur)'));

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      expect(screen.getByTestId('user').textContent).toBe('none');
      expect(getToken()).toBeNull();
    });
  });

  describe('useAuth en dehors de AuthProvider', () => {
    it('lève une erreur explicite', () => {
      function Orphan() {
        useAuth();
        return null;
      }
      // Évite que React n'affiche le warning d'erreur non catchée dans la console de test.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<Orphan />)).toThrow('useAuth doit être utilisé sous AuthProvider');

      spy.mockRestore();
    });
  });
});
