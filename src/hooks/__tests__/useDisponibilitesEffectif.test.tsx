import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDisponibilitesEffectif } from '../useDisponibilitesEffectif';
import {
  fetchDisponibilitesEffectif,
  type DisponibilitesEffectifResponseDto,
} from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const reponseVide: DisponibilitesEffectifResponseDto = { activites: [], joueurs: [] };

describe('useDisponibilitesEffectif', () => {
  beforeEach(() => {
    vi.mocked(fetchDisponibilitesEffectif).mockReset();
  });

  it('expose la grille renvoyée par fetchDisponibilitesEffectif en succès', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => useDisponibilitesEffectif(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(reponseVide);
  });

  it('expose isError quand fetchDisponibilitesEffectif rejette', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useDisponibilitesEffectif(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('transmet le filtre reçu à fetchDisponibilitesEffectif', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue(reponseVide);

    const { result } = renderHook(() => useDisponibilitesEffectif({ activiteId: 'a1' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchDisponibilitesEffectif).toHaveBeenCalledWith({ activiteId: 'a1' });
  });

  it('utilise une queryKey distincte par filtre (deux filtres différents ne partagent pas le cache)', async () => {
    vi.mocked(fetchDisponibilitesEffectif).mockResolvedValue(reponseVide);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useDisponibilitesEffectif({ activiteId: 'a1' }), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryState(['disponibilites-effectif', { activiteId: 'a1' }])?.status,
      ).toBe('success'),
    );
  });
});
