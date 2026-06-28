import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useImporterMatchsDistrict } from '../useImporterMatchsDistrict';
import { importerMatchsDistrict } from '../../api/activites';
import type { ImportMatchsResultatDto } from '../../api/activites';

vi.mock('../../api/activites');

const resultat: ImportMatchsResultatDto = {
  matchsRecuperes: 3,
  crees: 2,
  misAJour: 1,
  ignores: 0,
  erreurs: [],
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useImporterMatchsDistrict', () => {
  beforeEach(() => {
    vi.mocked(importerMatchsDistrict).mockReset();
  });

  it('appelle importerMatchsDistrict sans argument et expose le résultat en succès', async () => {
    vi.mocked(importerMatchsDistrict).mockResolvedValue(resultat);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useImporterMatchsDistrict(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(importerMatchsDistrict).toHaveBeenCalledWith(undefined, expect.anything());
    expect(result.current.data).toEqual(resultat);
  });

  it('invalide la queryKey ["activites"] après un import réussi', async () => {
    vi.mocked(importerMatchsDistrict).mockResolvedValue(resultat);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useImporterMatchsDistrict(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['activites'] });
  });

  it("expose isError et n'invalide pas le cache quand l'import échoue (ex. source non configurée)", async () => {
    vi.mocked(importerMatchsDistrict).mockRejectedValue(new Error('Import indisponible'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useImporterMatchsDistrict(), { wrapper: makeWrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Import indisponible');
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
