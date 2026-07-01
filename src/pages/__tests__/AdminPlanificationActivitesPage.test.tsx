import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPlanificationActivitesPage } from '../AdminPlanificationActivitesPage';
import { usePlanificationActivites } from '../../hooks/usePlanificationActivites';
import { useDeplacerActivite } from '../../hooks/useDeplacerActivite';
import type { ActiviteDto, PlanificationActivitesDto } from '../../api/activites';

vi.mock('../../hooks/usePlanificationActivites');
vi.mock('../../hooks/useDeplacerActivite');

function makeActivite(overrides: Partial<ActiviteDto> = {}): ActiviteDto {
  return {
    id: 'a1',
    date: undefined,
    heureConvocation: '14:00',
    heureDebut: '15:00',
    label: 'Match amical',
    type: 'match',
    source: 'manuel',
    ...overrides,
  };
}

function mockUsePlanificationActivites(
  overrides: Partial<ReturnType<typeof usePlanificationActivites>> = {},
) {
  vi.mocked(usePlanificationActivites).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof usePlanificationActivites>);
}

function renderPage() {
  return render(<AdminPlanificationActivitesPage />, { wrapper: MemoryRouter });
}

/** Sélectionne tous les jours de semaine pour rendre l'affichage de la colonne « Calendrier »
 * indépendant du jour courant lors de l'exécution des tests (seul Vendredi est sélectionné par
 * défaut). */
function selectionnerTousLesJours() {
  ['Lun', 'Mar', 'Mer', 'Jeu', 'Sam', 'Dim'].forEach((jour) => {
    fireEvent.click(screen.getByRole('button', { name: jour }));
  });
}

describe('AdminPlanificationActivitesPage', () => {
  let deplacerMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(usePlanificationActivites).mockReset();
    deplacerMutate = vi.fn();
    vi.mocked(useDeplacerActivite).mockReturnValue({
      mutate: deplacerMutate,
    } as unknown as ReturnType<typeof useDeplacerActivite>);
  });

  it('affiche le message de chargement pendant isLoading, sans colonnes', () => {
    mockUsePlanificationActivites({ isLoading: true });

    renderPage();

    expect(screen.getByText('Chargement de la planification…')).toBeInTheDocument();
    expect(screen.queryByText('Sans date')).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur quand isError est vrai", () => {
    mockUsePlanificationActivites({ isError: true });

    renderPage();

    expect(screen.getByText('Impossible de charger la planification.')).toBeInTheDocument();
  });

  it('affiche les activités sans date dans la colonne "Sans date"', () => {
    const activite = makeActivite({ label: 'Match amical' });
    const data: PlanificationActivitesDto = { sansDate: [activite], calendrier: [] };
    mockUsePlanificationActivites({ data });

    renderPage();

    expect(screen.getByRole('button', { name: /Match amical/ })).toBeInTheDocument();
  });

  it('ouvre la popup de détail quand on clique sur une carte sans sélection active', () => {
    const activite = makeActivite({ label: 'Match amical' });
    const data: PlanificationActivitesDto = { sansDate: [activite], calendrier: [] };
    mockUsePlanificationActivites({ data });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Match amical/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Match amical' })).toBeInTheDocument();
  });

  it('ferme la popup de détail quand on clique sur "Fermer"', () => {
    const activite = makeActivite({ label: 'Match amical' });
    const data: PlanificationActivitesDto = { sansDate: [activite], calendrier: [] };
    mockUsePlanificationActivites({ data });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Match amical/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it(
    'mode de repli (sélection-clic puis clic-cible) : déplacer une activité sans date vers une date ' +
      'du calendrier appelle onDeplacer avec cette date',
    () => {
      const activite = makeActivite({ id: 'a1', label: 'Match amical' });
      const data: PlanificationActivitesDto = { sansDate: [activite], calendrier: [] };
      mockUsePlanificationActivites({ data });

      renderPage();
      selectionnerTousLesJours();
      fireEvent.click(screen.getByRole('button', { name: 'Sélectionner une activité pour la déplacer' }));

      const colonnesDate = document.querySelectorAll('.colonne-date');
      expect(colonnesDate.length).toBeGreaterThan(0);
      fireEvent.click(colonnesDate[0] as HTMLElement);

      expect(deplacerMutate).toHaveBeenCalledTimes(1);
      const [variables] = deplacerMutate.mock.calls[0] as [{ activiteId: string; cibleDate: string | null }];
      expect(variables.activiteId).toBe('a1');
      expect(typeof variables.cibleDate).toBe('string');
    },
  );

  it(
    'mode de repli : déplacer une activité datée vers la colonne "Sans date" appelle onDeplacer ' +
      'avec cibleDate: null',
    () => {
      const aujourdhui = new Date().toISOString().slice(0, 10);
      const activite = makeActivite({ id: 'a-datee', label: 'Match amical', date: aujourdhui });
      const data: PlanificationActivitesDto = { sansDate: [], calendrier: [activite] };
      mockUsePlanificationActivites({ data });

      renderPage();
      selectionnerTousLesJours();
      fireEvent.click(screen.getByRole('button', { name: /Match amical/ }));

      fireEvent.click(document.querySelector('.colonne-sans-date') as HTMLElement);

      expect(deplacerMutate).toHaveBeenCalledWith(
        { activiteId: 'a-datee', cibleDate: null },
        expect.anything(),
      );
    },
  );

  it('augmente la fenêtre temporelle de 4 semaines quand on clique sur "Charger plus"', () => {
    mockUsePlanificationActivites({ data: { sansDate: [], calendrier: [] } });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Charger plus (+4 semaines)' }));

    expect(usePlanificationActivites).toHaveBeenLastCalledWith(12);
  });

  it('affiche une erreur quand la mutation de déplacement échoue', () => {
    const activite = makeActivite({ id: 'a1', label: 'Match amical' });
    const data: PlanificationActivitesDto = { sansDate: [activite], calendrier: [] };
    mockUsePlanificationActivites({ data });
    deplacerMutate.mockImplementation((_vars, { onError }) => onError(new Error('Accès refusé')));

    renderPage();
    selectionnerTousLesJours();
    fireEvent.click(screen.getByRole('button', { name: 'Sélectionner une activité pour la déplacer' }));
    fireEvent.click(document.querySelectorAll('.colonne-date')[0] as HTMLElement);

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
  });
});
