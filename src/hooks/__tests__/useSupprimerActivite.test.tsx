import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSupprimerActivite } from '../useSupprimerActivite';
import { supprimerActivite } from '../../api/activites';

vi.mock('../../api/activites');

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSupprimerActivite', () => {
  beforeEach(() => {
    vi.mocked(supprimerActivite).mockReset();
  });

  it('appelle supprimerActivite avec l\'id fourni', async () => {
    vi.mocked(supprimerActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSupprimerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supprimerActivite).toHaveBeenCalledWith('a1');
  });

  it('invalide la queryKey ["activites"] après une suppression réussie', async () => {
    vi.mocked(supprimerActivite).mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSupprimerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites'] });
  });

  it('expose isError quand supprimerActivite rejette (ex: 404)', async () => {
    vi.mocked(supprimerActivite).mockRejectedValue(new Error('Activité introuvable'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useSupprimerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate('inconnue');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
