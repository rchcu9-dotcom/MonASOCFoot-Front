import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useModifierMonProfil } from '../useModifierMonProfil';
import { modifierMonProfil } from '../../api/users';
import type { UtilisateurDto } from '../../api/users';
import { useAuth } from '../../auth/AuthContext';

vi.mock('../../api/users');
vi.mock('../../auth/AuthContext');

const utilisateurModifie: UtilisateurDto = {
  id: 'u1',
  providerId: 'provider-1',
  provider: 'google',
  displayName: 'Joueur Un',
  role: 'joueur',
  dateApparition: '2026-01-01T00:00:00.000Z',
  dateNaissance: '1990-05-12',
  numeroLicence: '12345678',
};

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  const refresh = vi.fn();
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    googleLoginUrl: 'http://localhost:3020/auth/google',
    devLogin: vi.fn(),
    refresh,
    logout: vi.fn(),
    ...overrides,
  });
  return refresh;
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useModifierMonProfil', () => {
  beforeEach(() => {
    vi.mocked(modifierMonProfil).mockReset();
  });

  it('appelle modifierMonProfil avec le DTO fourni et expose le résultat en succès', async () => {
    mockAuth();
    vi.mocked(modifierMonProfil).mockResolvedValue(utilisateurModifie);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierMonProfil(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ dateNaissance: '1990-05-12', numeroLicence: '12345678' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierMonProfil).toHaveBeenCalledWith(
      { dateNaissance: '1990-05-12', numeroLicence: '12345678' },
      expect.anything(),
    );
    expect(result.current.data).toEqual(utilisateurModifie);
  });

  it("rafraîchit le profil courant (refresh() d'AuthContext) après une modification réussie", async () => {
    const refresh = mockAuth();
    vi.mocked(modifierMonProfil).mockResolvedValue(utilisateurModifie);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierMonProfil(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ dateNaissance: '1990-05-12', numeroLicence: '12345678' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("expose isError et n'appelle pas refresh() quand modifierMonProfil rejette (ex: date future rejetée en 400)", async () => {
    const refresh = mockAuth();
    vi.mocked(modifierMonProfil).mockRejectedValue(
      new Error('La date de naissance ne peut pas être dans le futur'),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierMonProfil(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ dateNaissance: '2099-01-01' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(refresh).not.toHaveBeenCalled();
  });
});
