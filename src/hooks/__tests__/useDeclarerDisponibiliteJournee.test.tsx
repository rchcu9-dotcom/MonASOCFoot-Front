import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeclarerDisponibiliteJournee } from '../useDeclarerDisponibiliteJournee';
import { declarerDisponibiliteJournee } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDeclarerDisponibiliteJournee', () => {
  beforeEach(() => {
    vi.mocked(declarerDisponibiliteJournee).mockReset();
  });

  it('appelle declarerDisponibiliteJournee avec date et dto fournis', async () => {
    const dto = { statut: 'present' as const, commentaire: 'Je viens' };
    vi.mocked(declarerDisponibiliteJournee).mockResolvedValue({
      id: 'dispo-journee-1',
      utilisateurId: 'u1',
      date: '2026-07-01',
      statut: 'present',
      commentaire: 'Je viens',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeclarerDisponibiliteJournee(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ date: '2026-07-01', dto });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(declarerDisponibiliteJournee).toHaveBeenCalledWith('2026-07-01', dto);
  });

  it('invalide à la fois ["disponibilites-effectif"] ET ["mes-disponibilites-journee"] après une déclaration réussie', async () => {
    vi.mocked(declarerDisponibiliteJournee).mockResolvedValue({
      id: 'dispo-journee-1',
      utilisateurId: 'u1',
      date: '2026-07-01',
      statut: 'present',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeclarerDisponibiliteJournee(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ date: '2026-07-01', dto: { statut: 'present' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['disponibilites-effectif'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['mes-disponibilites-journee'] });
  });

  it('invalide aussi la queryKey ["resume-accueil"] après une déclaration réussie (popup réutilisée sur la page Accueil)', async () => {
    vi.mocked(declarerDisponibiliteJournee).mockResolvedValue({
      id: 'dispo-journee-1',
      utilisateurId: 'u1',
      date: '2026-07-01',
      statut: 'present',
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeclarerDisponibiliteJournee(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ date: '2026-07-01', dto: { statut: 'present' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['resume-accueil'] });
  });

  it('expose isError quand declarerDisponibiliteJournee rejette (ex: 403)', async () => {
    vi.mocked(declarerDisponibiliteJournee).mockRejectedValue(
      new Error("Seul un admin peut modifier la disponibilité d'un autre utilisateur"),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeclarerDisponibiliteJournee(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({
      date: '2026-07-01',
      dto: { statut: 'absent', utilisateurId: 'autre' },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("n'invalide aucune query quand la mutation échoue", async () => {
    vi.mocked(declarerDisponibiliteJournee).mockRejectedValue(new Error('Erreur 500'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeclarerDisponibiliteJournee(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current.mutate({ date: '2026-07-01', dto: { statut: 'present' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
