import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDisponibilitesEffectif } from '../useDisponibilitesEffectif';
import { fetchDisponibilitesEffectif } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useDisponibilitesEffectif', () => {
  beforeEach(() => {
    vi.mocked(fetchDisponibilitesEffectif).mockReset();
  });

  it('appelle fetchDisponibilitesEffectif avec le filtre fourni et expose les données en succès', async () => {
    const reponse = { activites: [], joueurs: [] };
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue(reponse);

    const { result } = renderHook(() => useDisponibilitesEffectif({ activiteId: 'a1' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchDisponibilitesEffectif).toHaveBeenCalledWith({ activiteId: 'a1' });
    expect(result.current.data).toEqual(reponse);
  });

  it('appelle fetchDisponibilitesEffectif sans argument quand aucun filtre n\'est fourni', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue({ activites: [], joueurs: [] });

    const { result } = renderHook(() => useDisponibilitesEffectif(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchDisponibilitesEffectif).toHaveBeenCalledWith(undefined);
  });

  it('expose isError quand fetchDisponibilitesEffectif rejette', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useDisponibilitesEffectif(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('utilise une queryKey distincte selon le filtre, pour ne pas partager le cache entre deux filtres différents', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue({ activites: [], joueurs: [] });

    const { result, rerender } = renderHook(
      ({ filtre }) => useDisponibilitesEffectif(filtre),
      { wrapper, initialProps: { filtre: { activiteId: 'a1' } } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ filtre: { activiteId: 'a2' } });

    await waitFor(() =>
      expect(fetchDisponibilitesEffectif).toHaveBeenLastCalledWith({ activiteId: 'a2' }),
    );
  });
});
