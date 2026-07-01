import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeclarerDisponibiliteActivite } from '../useDeclarerDisponibiliteActivite';
import { declarerDisponibiliteActivite } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDeclarerDisponibiliteActivite', () => {
  beforeEach(() => {
    vi.mocked(declarerDisponibiliteActivite).mockReset();
  });

  it('appelle declarerDisponibiliteActivite avec activiteId et dto fournis', async () => {
    const dto = { statut: 'present' as const, commentaire: 'Je viens' };
    vi.mocked(declarerDisponibiliteActivite).mockResolvedValue({
      id: 'dispo-1',
      utilisateurId: 'u1',
      activiteId: 'activite-1',
      statut: 'present',
      commentaire: 'Je viens',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeclarerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1', dto });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(declarerDisponibiliteActivite).toHaveBeenCalledWith('activite-1', dto);
  });

  it('invalide la queryKey ["disponibilites-effectif"] après une déclaration réussie', async () => {
    vi.mocked(declarerDisponibiliteActivite).mockResolvedValue({
      id: 'dispo-1',
      utilisateurId: 'u1',
      activiteId: 'activite-1',
      statut: 'present',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeclarerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1', dto: { statut: 'present' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['disponibilites-effectif'] });
  });

  it('invalide aussi la queryKey ["resume-accueil"] après une déclaration réussie (popup réutilisée sur la page Accueil)', async () => {
    vi.mocked(declarerDisponibiliteActivite).mockResolvedValue({
      id: 'dispo-1',
      utilisateurId: 'u1',
      activiteId: 'activite-1',
      statut: 'present',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeclarerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1', dto: { statut: 'present' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['resume-accueil'] });
  });

  it('expose isError quand declarerDisponibiliteActivite rejette (ex: 403)', async () => {
    vi.mocked(declarerDisponibiliteActivite).mockRejectedValue(
      new Error("Seul un admin peut modifier la disponibilité d'un autre utilisateur"),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeclarerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1', dto: { statut: 'absent', utilisateurId: 'autre' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
