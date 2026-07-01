import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSupprimerDisponibiliteActivite } from '../useSupprimerDisponibiliteActivite';
import { supprimerDisponibiliteActivite } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSupprimerDisponibiliteActivite', () => {
  beforeEach(() => {
    vi.mocked(supprimerDisponibiliteActivite).mockReset();
  });

  it('appelle supprimerDisponibiliteActivite avec activiteId, sans utilisateurId quand non fourni', async () => {
    vi.mocked(supprimerDisponibiliteActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSupprimerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supprimerDisponibiliteActivite).toHaveBeenCalledWith('activite-1', undefined);
  });

  it('transmet utilisateurId quand fourni (cas admin ciblant un autre utilisateur)', async () => {
    vi.mocked(supprimerDisponibiliteActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSupprimerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1', utilisateurId: 'joueur-cible' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supprimerDisponibiliteActivite).toHaveBeenCalledWith('activite-1', 'joueur-cible');
  });

  it('invalide la queryKey ["disponibilites-effectif"] après une suppression réussie', async () => {
    vi.mocked(supprimerDisponibiliteActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSupprimerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['disponibilites-effectif'] });
  });

  it('invalide aussi la queryKey ["resume-accueil"] après une suppression réussie (popup réutilisée sur la page Accueil)', async () => {
    vi.mocked(supprimerDisponibiliteActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSupprimerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['resume-accueil'] });
  });

  it('expose isError quand supprimerDisponibiliteActivite rejette (ex: 404 aucune surcharge)', async () => {
    vi.mocked(supprimerDisponibiliteActivite).mockRejectedValue(
      new Error("Aucune surcharge de disponibilité pour l'activité activite-1"),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSupprimerDisponibiliteActivite(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ activiteId: 'activite-1' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
