import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreerActivite } from '../useCreerActivite';
import { creerActivite } from '../../api/activites';
import type { ActiviteDto, CreerActiviteInput } from '../../api/activites';

vi.mock('../../api/activites');

const activiteCreee: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  source: 'manuel',
};

const input: CreerActiviteInput = {
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreerActivite', () => {
  beforeEach(() => {
    vi.mocked(creerActivite).mockReset();
  });

  it('appelle creerActivite avec le payload fourni et expose le résultat en succès', async () => {
    vi.mocked(creerActivite).mockResolvedValue(activiteCreee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useCreerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(creerActivite).toHaveBeenCalledWith(input, expect.anything());
    expect(result.current.data).toEqual(activiteCreee);
  });

  it('invalide la queryKey ["activites"] après une création réussie', async () => {
    vi.mocked(creerActivite).mockResolvedValue(activiteCreee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites'] });
  });

  it("expose isError et n'invalide pas le cache quand creerActivite rejette", async () => {
    vi.mocked(creerActivite).mockRejectedValue(new Error('Forbidden'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreerActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
