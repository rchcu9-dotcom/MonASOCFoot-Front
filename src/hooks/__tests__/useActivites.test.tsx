import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useActivites } from '../useActivites';
import { fetchActivites } from '../../api/activites';
import type { ActiviteDto } from '../../api/activites';

vi.mock('../../api/activites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const activite: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Match amical',
  type: 'match',
  source: 'manuel',
};

describe('useActivites', () => {
  beforeEach(() => {
    vi.mocked(fetchActivites).mockReset();
  });

  it('expose les activités renvoyées par fetchActivites en succès', async () => {
    vi.mocked(fetchActivites).mockResolvedValue([activite]);

    const { result } = renderHook(() => useActivites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([activite]);
  });

  it('expose isError quand fetchActivites rejette', async () => {
    vi.mocked(fetchActivites).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useActivites(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('utilise la queryKey ["activites"]', async () => {
    vi.mocked(fetchActivites).mockResolvedValue([]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useActivites(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await waitFor(() => expect(queryClient.getQueryState(['activites'])?.status).toBe('success'));
  });

  it("n'appelle pas fetchActivites quand enabled vaut false", async () => {
    vi.mocked(fetchActivites).mockResolvedValue([activite]);

    const { result } = renderHook(() => useActivites({ enabled: false }), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(fetchActivites).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('appelle fetchActivites quand enabled vaut true (comportement identique à sans option)', async () => {
    vi.mocked(fetchActivites).mockResolvedValue([activite]);

    const { result } = renderHook(() => useActivites({ enabled: true }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchActivites).toHaveBeenCalledTimes(1);
  });
});
