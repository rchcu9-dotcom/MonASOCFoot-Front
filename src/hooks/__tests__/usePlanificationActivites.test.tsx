import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePlanificationActivites } from '../usePlanificationActivites';
import { fetchPlanificationActivites } from '../../api/activites';
import type { PlanificationActivitesDto } from '../../api/activites';

vi.mock('../../api/activites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const reponseVide: PlanificationActivitesDto = { sansDate: [], calendrier: [] };

describe('usePlanificationActivites', () => {
  beforeEach(() => {
    vi.mocked(fetchPlanificationActivites).mockReset();
  });

  it('appelle fetchPlanificationActivites avec le nombre de semaines fourni et expose les données en succès', async () => {
    vi.mocked(fetchPlanificationActivites).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => usePlanificationActivites(8), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchPlanificationActivites).toHaveBeenCalledWith(8);
    expect(result.current.data).toEqual(reponseVide);
  });

  it('utilise une queryKey distincte selon "semaines", pour ne pas partager le cache entre deux fenêtres différentes', async () => {
    vi.mocked(fetchPlanificationActivites).mockResolvedValue(reponseVide);

    const { result, rerender } = renderHook(
      ({ semaines }) => usePlanificationActivites(semaines),
      { wrapper, initialProps: { semaines: 8 } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ semaines: 12 });

    await waitFor(() => expect(fetchPlanificationActivites).toHaveBeenLastCalledWith(12));
  });

  it('expose isError quand fetchPlanificationActivites rejette', async () => {
    vi.mocked(fetchPlanificationActivites).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => usePlanificationActivites(8), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
