import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useResumeAccueil } from '../useResumeAccueil';
import { fetchResumeAccueil, type ResumeAccueilDto } from '../../api/disponibilites';

vi.mock('../../api/disponibilites');

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const resumeVide: ResumeAccueilDto = {
  prochainesDates: [],
  tableauDeBord: { totalAVenir: 0, renseigneesAVenir: 0, pourcentageRenseignement: 0 },
};

describe('useResumeAccueil', () => {
  beforeEach(() => {
    vi.mocked(fetchResumeAccueil).mockReset();
  });

  it('expose le résumé renvoyé par fetchResumeAccueil en succès', async () => {
    vi.mocked(fetchResumeAccueil).mockResolvedValue(resumeVide);

    const { result } = renderHook(() => useResumeAccueil(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(resumeVide);
  });

  it('expose isError quand fetchResumeAccueil rejette', async () => {
    vi.mocked(fetchResumeAccueil).mockRejectedValue(new Error('Erreur 500'));

    const { result } = renderHook(() => useResumeAccueil(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("n'appelle pas fetchResumeAccueil quand enabled vaut false (visiteur non connecté)", async () => {
    vi.mocked(fetchResumeAccueil).mockResolvedValue(resumeVide);

    const { result } = renderHook(() => useResumeAccueil({ enabled: false }), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(fetchResumeAccueil).not.toHaveBeenCalled();
  });

  it('utilise la queryKey ["resume-accueil"]', async () => {
    vi.mocked(fetchResumeAccueil).mockResolvedValue(resumeVide);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useResumeAccueil(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(['resume-accueil'])?.status).toBe('success'),
    );
  });
});
