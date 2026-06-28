import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useModifierRoleUtilisateur } from '../useModifierRoleUtilisateur';
import { modifierRoleUtilisateur } from '../../api/users';
import type { UtilisateurDto } from '../../api/users';

vi.mock('../../api/users');

const utilisateurModifie: UtilisateurDto = {
  id: 'u1',
  providerId: 'provider-1',
  provider: 'google',
  displayName: 'Joueur Un',
  role: 'admin',
  dateApparition: '2026-01-01T00:00:00.000Z',
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useModifierRoleUtilisateur', () => {
  beforeEach(() => {
    vi.mocked(modifierRoleUtilisateur).mockReset();
  });

  it('appelle modifierRoleUtilisateur avec id et role, et expose le résultat en succès', async () => {
    vi.mocked(modifierRoleUtilisateur).mockResolvedValue(utilisateurModifie);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierRoleUtilisateur(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'u1', role: 'admin' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierRoleUtilisateur).toHaveBeenCalledWith('u1', 'admin');
    expect(result.current.data).toEqual(utilisateurModifie);
  });

  it('invalide la queryKey ["utilisateurs"] après une modification réussie', async () => {
    vi.mocked(modifierRoleUtilisateur).mockResolvedValue(utilisateurModifie);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useModifierRoleUtilisateur(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'u1', role: 'admin' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['utilisateurs'] });
  });

  it("expose isError et n'invalide pas le cache quand modifierRoleUtilisateur rejette (ex: auto-démotion 400)", async () => {
    vi.mocked(modifierRoleUtilisateur).mockRejectedValue(
      new Error('Un admin ne peut pas retirer son propre rôle admin'),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useModifierRoleUtilisateur(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'admin-connecte', role: 'joueur' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
