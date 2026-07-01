import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeplacerActivite } from '../useDeplacerActivite';
import { modifierActivite } from '../../api/activites';
import type { ActiviteDto } from '../../api/activites';

vi.mock('../../api/activites');

const activiteDeplacee: ActiviteDto = {
  id: 'a1',
  date: '2026-07-10',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  source: 'manuel',
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDeplacerActivite', () => {
  beforeEach(() => {
    vi.mocked(modifierActivite).mockReset();
  });

  it('appelle modifierActivite avec { date: cibleDate } quand on assigne une date (colonne gauche → droite)', async () => {
    vi.mocked(modifierActivite).mockResolvedValue(activiteDeplacee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeplacerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ activiteId: 'a1', cibleDate: '2026-07-10' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierActivite).toHaveBeenCalledWith('a1', { date: '2026-07-10' });
  });

  it('appelle modifierActivite avec { date: null } quand on retire la date (colonne droite → gauche)', async () => {
    vi.mocked(modifierActivite).mockResolvedValue({ ...activiteDeplacee, date: undefined });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeplacerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ activiteId: 'a1', cibleDate: null });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierActivite).toHaveBeenCalledWith('a1', { date: null });
  });

  it('appelle modifierActivite avec la nouvelle date quand on déplace une activité déjà datée vers une autre date (droite → droite)', async () => {
    vi.mocked(modifierActivite).mockResolvedValue({ ...activiteDeplacee, date: '2026-08-01' });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeplacerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ activiteId: 'a1', cibleDate: '2026-08-01' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierActivite).toHaveBeenCalledWith('a1', { date: '2026-08-01' });
  });

  it('invalide les caches "activites-planification" et "activites" après un déplacement réussi', async () => {
    vi.mocked(modifierActivite).mockResolvedValue(activiteDeplacee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeplacerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ activiteId: 'a1', cibleDate: '2026-07-10' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites-planification'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites'] });
  });

  it('expose isError quand modifierActivite rejette', async () => {
    vi.mocked(modifierActivite).mockRejectedValue(new Error('Accès refusé'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useDeplacerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ activiteId: 'a1', cibleDate: '2026-07-10' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
