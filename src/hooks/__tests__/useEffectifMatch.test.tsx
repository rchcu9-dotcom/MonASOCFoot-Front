import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffectifMatch } from '../useEffectifMatch';
import { fetchEffectifMatch, type EffectifMatchResponseDto } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const reponseVide: EffectifMatchResponseDto = {
  matchCourant: null,
  matchPrecedentId: null,
  matchSuivantId: null,
  badge: null,
  joueurs: [],
};

describe('useEffectifMatch', () => {
  beforeEach(() => {
    vi.mocked(fetchEffectifMatch).mockReset();
  });

  it('expose la réponse renvoyée par fetchEffectifMatch en succès', async () => {
    vi.mocked(fetchEffectifMatch).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => useEffectifMatch(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(reponseVide);
  });

  it('expose isError quand fetchEffectifMatch rejette', async () => {
    vi.mocked(fetchEffectifMatch).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useEffectifMatch(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('appelle fetchEffectifMatch sans argument quand aucun matchId n\'est fourni', async () => {
    vi.mocked(fetchEffectifMatch).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => useEffectifMatch(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchEffectifMatch).toHaveBeenCalledWith(undefined);
  });

  it('transmet le matchId reçu à fetchEffectifMatch', async () => {
    vi.mocked(fetchEffectifMatch).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => useEffectifMatch('m1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchEffectifMatch).toHaveBeenCalledWith('m1');
  });

  it('utilise une queryKey distincte par matchId (deux matchs différents ne partagent pas le cache)', async () => {
    vi.mocked(fetchEffectifMatch).mockResolvedValue(reponseVide);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useEffectifMatch('m1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(['effectif-match', 'm1'])?.status).toBe('success'),
    );
  });
});
