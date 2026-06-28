import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useModifierActivite } from '../useModifierActivite';
import { modifierActivite } from '../../api/activites';
import type { ActiviteDto } from '../../api/activites';

vi.mock('../../api/activites');

const activiteModifiee: ActiviteDto = {
  id: 'a1',
  date: '2026-07-01',
  heureConvocation: '14:00',
  heureDebut: '15:00',
  label: 'Label modifié',
  type: 'match',
  source: 'manuel',
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useModifierActivite', () => {
  beforeEach(() => {
    vi.mocked(modifierActivite).mockReset();
  });

  it('appelle modifierActivite avec id et dto, et expose le résultat en succès', async () => {
    vi.mocked(modifierActivite).mockResolvedValue(activiteModifiee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'a1', dto: { label: 'Label modifié' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modifierActivite).toHaveBeenCalledWith('a1', { label: 'Label modifié' });
    expect(result.current.data).toEqual(activiteModifiee);
  });

  it('invalide la queryKey ["activites"] après une modification réussie', async () => {
    vi.mocked(modifierActivite).mockResolvedValue(activiteModifiee);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useModifierActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'a1', dto: { label: 'Label modifié' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites'] });
  });

  it('expose isError quand modifierActivite rejette (ex: 404)', async () => {
    vi.mocked(modifierActivite).mockRejectedValue(new Error('Activité introuvable'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useModifierActivite(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate({ id: 'inconnue', dto: { label: 'x' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
