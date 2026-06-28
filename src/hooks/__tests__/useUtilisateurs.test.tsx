import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUtilisateurs } from '../useUtilisateurs';
import { fetchUtilisateurs } from '../../api/users';
import type { UtilisateurDto } from '../../api/users';

vi.mock('../../api/users');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const utilisateur: UtilisateurDto = {
  id: 'u1',
  providerId: 'provider-1',
  provider: 'google',
  displayName: 'Joueur Un',
  role: 'joueur',
  dateApparition: '2026-01-01T00:00:00.000Z',
};

describe('useUtilisateurs', () => {
  beforeEach(() => {
    vi.mocked(fetchUtilisateurs).mockReset();
  });

  it('expose les utilisateurs renvoyés par fetchUtilisateurs en succès', async () => {
    vi.mocked(fetchUtilisateurs).mockResolvedValue([utilisateur]);

    const { result } = renderHook(() => useUtilisateurs(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([utilisateur]);
  });

  it('expose isError quand fetchUtilisateurs rejette', async () => {
    vi.mocked(fetchUtilisateurs).mockRejectedValue(new Error('Erreur 403'));

    const { result } = renderHook(() => useUtilisateurs(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('utilise la queryKey ["utilisateurs"]', async () => {
    vi.mocked(fetchUtilisateurs).mockResolvedValue([]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useUtilisateurs(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });

    await waitFor(() => expect(queryClient.getQueryState(['utilisateurs'])?.status).toBe('success'));
  });
});
