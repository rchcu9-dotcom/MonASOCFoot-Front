import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMesDisponibilitesJournee } from '../useMesDisponibilitesJournee';
import { fetchMesDisponibilitesJournee } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useMesDisponibilitesJournee', () => {
  beforeEach(() => {
    vi.mocked(fetchMesDisponibilitesJournee).mockReset();
  });

  it('appelle fetchMesDisponibilitesJournee et expose les données en succès', async () => {
    const reponse = [
      { id: 'd1', utilisateurId: 'u1', date: '2026-07-01', statut: 'present' as const },
    ];
    vi.mocked(fetchMesDisponibilitesJournee).mockResolvedValue(reponse);

    const { result } = renderHook(() => useMesDisponibilitesJournee(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMesDisponibilitesJournee).toHaveBeenCalled();
    expect(result.current.data).toEqual(reponse);
  });

  it('expose isError quand fetchMesDisponibilitesJournee rejette', async () => {
    vi.mocked(fetchMesDisponibilitesJournee).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useMesDisponibilitesJournee(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
